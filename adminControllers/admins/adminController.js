const expressAsyncHandler = require("express-async-handler");
const Admin = require("../../models/Admin");
const fs = require('fs');
const cloudinaryUploadImage = require("../../utils/cloudinary");
const generateToken = require("../../config/token/generateToken");

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

    if (usuarioAchado && usuarioAchado.senhaConfere(senha)) {
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
    const localPath = `public/imagens/perfilAdmin/${req.file.filename}`;
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