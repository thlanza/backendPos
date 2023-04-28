const expressAsyncHandler = require("express-async-handler");
const Admin = require("../../models/Admin");
const fs = require('fs');
const { cloudinaryUploadImage, cloudinaryDelete } = require("../../utils/cloudinary");
const generateToken = require("../../config/token/generateToken");
const Presenca = require("../../models/Presenca");
const Modalidade = require("../../models/Modalidade");
const Comprovante = require("../../models/Comprovante");
const Aluno = require("../../models/Aluno");
const { validarMongoIdMetodo } = require("../../utils/validarMongoId");


exports.primeiroLogin = expressAsyncHandler(async (req, res) => {
    const { email, senha } = req.body;

    if (senha === process.env.SENHA && email === process.env.EMAIL) {
        res.json({ aceito: true })
    } else {
        res.status(401);
        throw new Error('Credenciais de login erradas.');
    }
});

exports.login = expressAsyncHandler(async (req, res) => {
    const { email, senha } = req.body;

    const usuarioAchado = await Admin.findOne({ email});

    if (!usuarioAchado) {
        throw new Error("Credenciais de login erradas.")
    }

    let confere = await usuarioAchado.senhaConfere(senha);


    if (usuarioAchado && confere) {
        res.json({
            usuario: usuarioAchado,
            token: generateToken(usuarioAchado?._id)
        })
    } else {
        throw new Error("Credenciais de login erradas.")
    }
});

exports.registrar = expressAsyncHandler(async (req, res) => {
    //Checar se o admin já existe
    const adminExiste = await Admin.findOne({ email: req?.body?.email });
    if (adminExiste) throw new Error("Admin já existe.");

    //1. Caminho local para a imagem
    const localPath = `./${req.file.filename}`;
    //2. Fazer upload para o serviço Cloudinary
    
    const { url } = await cloudinaryUploadImage(localPath);
    const admin = await Admin.create({
        primeiroNome: req?.body?.primeiroNome,
        sobrenome: req?.body?.sobrenome,
        email: req?.body?.email,
        senha: req?.body?.senha,
        fotoDePerfil: url
    });
    //3. Deletar a imagem no servidor local
    fs.unlinkSync(localPath);
    res.json({
        usuario: admin,
        token: generateToken(admin._id)
    });
});

exports.deletarAdmin = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    const adminDeletado = await Admin.findByIdAndDelete(id); 
    res.status(204).json({"Admin deletado": adminDeletado });
});

exports.listaDePresenca = expressAsyncHandler(async (req, res) => {
    const { modalidadeId, mes, ano, dia } = req.query;
    if (!parseInt(mes) || !parseInt(dia) || !parseInt(ano)) {
        throw new Error("Deve ser número")
    }
    if (parseInt(mes) > 12 || parseInt(mes) < 1) {
        throw new Error("Mês inválido")
    }
    if (parseInt(dia) > 31 || parseInt(dia) < 1) {
        throw new Error("Dia inválido")
    }
    let data = `${dia}/${mes}/${ano}`;
    const dataExistente = await Presenca.find({ dataDaPresenca: data }); 
    if(dataExistente.length === 0) {
        const modalidades = await Modalidade.findById(modalidadeId).populate('alunos');
        const alunos = modalidades.alunos;
        const nomeModalidade = modalidades.nomeModalidade;
        let nomesAlunos = alunos.map(aluno => ({
            'nomeAluno': `${aluno.primeiroNome} ${aluno.sobrenome}`,
            'presenca': 'não informado'
        }));
        const presenca = await Presenca.create({
            presencas: nomesAlunos,
            dataDaPresenca: data,
            nomeModalidade
        });
        res.status(200).json(presenca);
        await Presenca.deleteOne({ _id: presenca._id })
        return;
    } else {
        res.status(200).json(dataExistente[0]);
        return;
    }
});

exports.painelDeComprovantes = expressAsyncHandler(async (req, res) => { 
    const comprovantes = await Comprovante.find({ });
    return res.status(200).json(comprovantes);
});

exports.deletarFoto = expressAsyncHandler(async (req, res) => { 
    let url = 'https://res.cloudinary.com/dghg3ip4e/image/upload/v1682688457/trppvwf8wxt5vs99uqdo.jpg';
    const re =  /(?:.+\/)(.+)/;
    const myArray = re.exec(url);
    let imagem = myArray[1];
    let imagemFormatada = imagem.replace('.jpg', '');
    console.log(imagemFormatada);
    const data = await cloudinaryDelete(imagemFormatada);
    console.log("data", data);
    return res.status(200).json("teste");
});

exports.validarComprovante = expressAsyncHandler(async (req, res) => { 
    const { valido, idComprovante } = req.body;
    const deletar = async (url) => {
        const re =  /(?:.+\/)(.+)/;
        const resultados = re.exec(url);
        const imagem = resultados[1].replace('.jpg', '');
        
        await cloudinaryDelete(imagem);
    }
    validarMongoIdMetodo(idComprovante);
    const comprovante = await Comprovante.findById(idComprovante);
    if (!comprovante) throw new Error("Comprovante não achado.")
    if (valido==="valido") {
        const idAluno = comprovante.idAluno;
        const atualizacao = {
            inadimplente: false,
            mesesInadimplente: 0
        }
        await Aluno.findByIdAndUpdate(idAluno, atualizacao, {
            returnOriginal: false
        });
        await deletar(comprovante.urlFoto);
        
        await Comprovante.deleteOne({ _id: idComprovante })
        return res.status(200).json({ comprovante: "válido" });
    }
    if (valido==="invalido") {
        await deletar(comprovante.urlFoto);

        await Comprovante.deleteOne({ _id: idComprovante })
        return res.status(200).json({ comprovante: "inválido" });
    }
    throw new Error("Deve ser válido ou inválido");
});
