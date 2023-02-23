const expressAsyncHandler = require("express-async-handler");
const Aluno = require("../../models/Aluno");
const cloudinaryUploadImage = require("../../utils/cloudinary");
const fs = require("fs");
const generateToken = require("../../config/token/generateToken");
const { faker } = require('@faker-js/faker');
const { aleatorioRetira, elementoAleatorio, numeroAleatorio } = require("../../utils/aleatorios");
const Modalidade = require("../../models/Modalidade");
const PDFDocument = require('pdfkit');
const client = require('https');
const path = require('path');
const cwd = process.cwd();
const axios = require('axios');
const https = require('https');

exports.matricular = expressAsyncHandler(async (req, res) => {
//Checar se o admin já existe
const alunoExiste = await Aluno.findOne({ email: req?.body?.email });
if (alunoExiste) throw new Error("Aluno já existe.");

//1. Caminho local para a imagem
const localPath = `public/imagens/perfilAluno/${req.file.filename}`;

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
    console.log('chamado');
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
            mesesInadimplente
        }
    }

    let array = [];

    for (let i = 0; i < 50; i++) {
        array.push(gerarUsuarioAleatorio());
    }

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