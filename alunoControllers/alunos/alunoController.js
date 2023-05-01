const expressAsyncHandler = require("express-async-handler");
const Aluno = require("../../models/Aluno");
const { cloudinaryUploadImage, cloudinaryDelete } = require("../../utils/cloudinary");
const fs = require("fs");
const generateToken = require("../../config/token/generateToken");
const { faker } = require('@faker-js/faker');
const { aleatorioRetira, elementoAleatorio, numeroAleatorio, dataAleatoria } = require("../../utils/aleatorios");
const Modalidade = require("../../models/Modalidade");
const PDFDocument = require('pdfkit');
const client = require('https');
const path = require('path');
const cwd = process.cwd();
const axios = require('axios');
const https = require('https');
const Presenca = require("../../models/Presenca");
const Comprovante = require("../../models/Comprovante");

exports.matricular = expressAsyncHandler(async (req, res) => {
//Checar se o admin já existe
const alunoExiste = await Aluno.findOne({ email: req?.body?.email });
if (alunoExiste) throw new Error("Aluno já existe.");

//1. Caminho local para a imagem
const localPath = `./${req.file.filename}`;

//2. Fazer upload para o serviço Cloudinary

const { primeiroNome, 
    sobrenome, 
    email, 
    senha, 
    modalidade 
 } = req?.body;

const { url } = await cloudinaryUploadImage(localPath);
const aluno = await Aluno.create({
    primeiroNome,
    sobrenome,
    email,
    senha,
    fotoDePerfil: url,
    modalidade
});
//3. Deletar a imagem no servidor local
fs.unlinkSync(localPath);
res.json({
    usuario: aluno,
    token: generateToken(aluno._id)
});
});

exports.uploadDeComprovanteDePagamento = expressAsyncHandler(async (req, res) => {
    const { mes, ano
     } = req?.body;
    const localPath = `./${req.file.filename}`;
    const { url } = await cloudinaryUploadImage(localPath);
    const idAluno = req?.usuario?._id;

    const comprovante = await Comprovante.create({
        idAluno,
        mes,
        ano,
        urlFoto: url
    });
    fs.unlinkSync(localPath);
    return res.status(200).json(comprovante);
});

exports.matricularGoogle = expressAsyncHandler(async (req, res) => {
//Checar se o admin já existe
const alunoExiste = await Aluno.findOne({ email: req?.body?.email });
if (alunoExiste) throw new Error("Aluno já existe.");

const { 
    primeiroNome, 
    sobrenome, 
    email, 
    senha, 
    modalidade,
    fotoDePerfil 
 } = req?.body;

 const aluno = await Aluno.create({
    primeiroNome,
    sobrenome,
    email,
    senha,
    fotoDePerfil,
    modalidade
});

res.json({
    usuario: aluno,
    token: generateToken(aluno._id)
});
});

exports.alunoPorId = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;

    const usuarioAchado = await Aluno.findById(id);

    if (usuarioAchado) {
        return res.json({
            usuario: usuarioAchado,
        })
    } else {
        throw new Error("Não há aluno com esse id")
    }
});

exports.inadimplentes = expressAsyncHandler(async (req, res) => {
    const inadimplentes = await Aluno.find({ inadimplente: true });
    return res.json({
        inadimplentes
    });
});



exports.logar = expressAsyncHandler(async (req, res) => {
    const { email, senha } = req.body;

    const usuarioAchado = await Aluno.findOne({ email});

    if (usuarioAchado && usuarioAchado.senhaConfere(senha)) {
        res.json({
            usuario: usuarioAchado,
            token: generateToken(usuarioAchado?._id)
        })
    } else {
        throw new Error("Credenciais de login erradas.")
    }
});

exports.deletarAluno = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    const alunoDeletado = await Aluno.findOneAndDelete(id);
    res.json({"alunoDeletado": alunoDeletado})
});

exports.cancelarInscricao = expressAsyncHandler(async (req, res) => {
    const userId = req?.usuario?.id?.toString();
    const aluno = await Aluno.findById(userId);
    if (aluno.inadimplente) {
        res.status(400).json({
            mensagem: "Regularize seus débitos antes de cancelar a inscrição."
        })
    } else {
        await Aluno.findByIdAndDelete(userId);
        res.status(204).json({
            mensagem: "Inscrição cancelada."
        });
    }
});

exports.seedAlunos = expressAsyncHandler(async (req, res) => {
    const modalidades = await Modalidade.find({});
    const ids = modalidades.map(element => element._id.toString());

    let arrayBoolean = [true, false];

    const gerarUsuarioAleatorio = () => {
        let dataInicial, dataFinal;
        dataInicial = new Date(2022, 3, 1);
        dataFinal = new Date(2022, 11, 31);
        const booleano = elementoAleatorio(arrayBoolean);
        let mesesInadimplente;
        if (booleano) {
            mesesInadimplente = numeroAleatorio(5);
        } else {
            mesesInadimplente = 0;
        }
        return {
            primeiroNome: faker.name.firstName(),
            sobrenome: faker.name.lastName(),
            email: faker.internet.email(),
            senha: 'lanza1',
            fotoDePerfil: faker.image.avatar(640, 480, true),
            modalidade: elementoAleatorio(ids),
            inadimplente: booleano,
            dataDeInscricao: dataAleatoria(dataInicial, dataFinal),
            mesesInadimplente
        }
    }

    let array = [];

    for (let i = 0; i < 50; i++) {
        array.push(gerarUsuarioAleatorio());
    }

    console.log(array);

    await Aluno.insertMany(array);

    return res.status(201).json({
        mensagem: "Seed de alunos completo!"
    });
});

exports.getAlunos = expressAsyncHandler(async (req, res) => {
    const alunos = await Aluno.find({}).populate('modalidade');
    res.json(alunos);
});

exports.deletarColecaoAlunos = expressAsyncHandler(async (req, res) => {
    await Aluno.deleteMany({});
    res.status(204).json("Alunos deletados.");
});


exports.pdfDownload = expressAsyncHandler(async (req, res) => {


    var doc = new PDFDocument({bufferPages: true});

    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', async () => {

    
        let pdfData = Buffer.concat(buffers);

        res.writeHead(200, {
        'Content-Length': Buffer.byteLength(pdfData),
        'Content-Type': 'application/pdf',
        'Content-disposition': 'attachment;  filename=alunos.pdf',})
        .end(pdfData);
        
    });

    const object = await Aluno.find({  }).populate('modalidade').lean();
    
    let titulo = 'Lista dos Alunos \n\n';
    doc.font('Helvetica-Bold')
        .fontSize(14)
        .text(titulo, {
            align: 'center'
        });

    object.forEach(async element => {
        let string = '';
        let stringPrimeiroNome = element.primeiroNome;
        let stringSobrenome = element.sobrenome;
        let stringNome = stringPrimeiroNome + ' ' + stringSobrenome;
        let stringNomeFinal = `Nome: ${stringNome} \n`;
        string += stringNomeFinal;
        let email = element.email;
        let emailFinal = `Email: ${email} \n`;
        string += emailFinal;
        let modalidade = element.modalidade.nomeModalidade;
        let modalidadeFinal = `Modalidade: ${modalidade} \n`;
        string += modalidadeFinal;
        let horario = element.modalidade.horario;
        let horarioFinal = `Horário: ${horario} \n`;
        string += horarioFinal;
        let dias = element.modalidade.dias;
        let joinedDias = dias.join(', ');
        let diasFinal = `Dias: ${joinedDias} \n`;
        string += diasFinal;
        let inadimplente;
        if (element.inadimplente) {
            inadimplente = 'Sim';
        } else {
            inadimplente = 'Não'
        };
        let inadimplenteFinal = `Inadimplente: ${inadimplente} \n`;
        string += inadimplenteFinal;
        let mesesInadimplente = element.mesesInadimplente;
        let mesesInadimplenteFinal = `Meses Inadimplente: ${mesesInadimplente} \n`;
        string += mesesInadimplenteFinal;
        string += '\n';

        doc.font('Helvetica')
        .fontSize(12)
        .text(string);  

                      
    });

    doc.end();

});

exports.notificarPresenca = expressAsyncHandler(async (req, res) => {
    const { nomeModalidade, dataDaPresenca, presenca, nomeAluno } = req.body;

    if(presenca === 'não informado') throw new Error("Você deve informar se estava presente ou faltou.")

    let dataDePresencaExistente = await Presenca.find({ dataDaPresenca }); 
    if(dataDePresencaExistente.length === 0) {
        const modalidades = await Modalidade.find({ nomeModalidade: nomeModalidade }).populate('alunos');
        if(modalidades.length === 0) throw new Error("Modalidade não encontrada.");
        const alunos = modalidades?.[0].alunos;
        let alunosNomes = [];
        alunos.forEach(element => {
            let nome = element?.primeiroNome + " " + element?.sobrenome;
            alunosNomes.push(nome);
        });
        if(!alunosNomes.includes(nomeAluno)) throw new Error("O aluno não está matriculado nessa modalidade.")
        let nomesAlunos = alunos.map(aluno =>  {  
            let nome = `${aluno.primeiroNome} ${aluno.sobrenome}`
            return ({
            'nomeAluno': nome,
            'presenca': nome === nomeAluno ? presenca : 'não informado'
        })});

        const presencaModel = await Presenca.create({
            presencas: nomesAlunos,
            dataDaPresenca,
            nomeModalidade
        });
        
        return res.json(presencaModel);
    } else {
        let presencas = dataDePresencaExistente?.[0].presencas;
        let nomeAlunosPresentes = [];
        presencas.forEach(element => {
            nomeAlunosPresentes.push(element.nomeAluno);
        });
        let index = presencas.map(e => e.nomeAluno).indexOf(nomeAluno);
        if (index === -1) throw new Error("O aluno não está matriculado nessa modalidade.")
        presencas[index].presenca = presenca;
        let objetoSalvo = dataDePresencaExistente[0];
        const salvo = await Presenca.findOneAndUpdate(
            { dataDaPresenca },
            { $set: objetoSalvo },
            { new: true}
        )
        return res.json(salvo);
    }
});