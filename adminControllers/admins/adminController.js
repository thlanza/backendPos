const expressAsyncHandler = require("express-async-handler");
const Admin = require("../../models/Admin");
const fs = require('fs');
const cloudinaryUploadImage = require("../../utils/cloudinary");
const generateToken = require("../../config/token/generateToken");
const Presenca = require("../../models/Presenca");
const Modalidade = require("../../models/Modalidade");

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
        res.status(200).json(dataExistente);
        return;
    }
 
});