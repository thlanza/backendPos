const expressAsyncHandler = require("express-async-handler");
const Aluno = require("../../models/Aluno");
const cloudinaryUploadImage = require("../../utils/cloudinary");
const fs = require("fs");
const generateToken = require("../../config/token/generateToken");
const { faker } = require('@faker-js/faker');
const { aleatorioRetira, elementoAleatorio, numeroAleatorio } = require("../../utils/aleatorios");
const Modalidade = require("../../models/Modalidade");


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
    modalidade, 
    inadimplente, 
    mesesInadimplente } = req?.body;

const { url } = await cloudinaryUploadImage(localPath);
const aluno = await Aluno.create({
    primeiroNome,
    sobrenome,
    email,
    senha,
    fotoDePerfil: url,
    modalidade,
    inadimplente,
    mesesInadimplente
});
//3. Deletar a imagem no servidor local
fs.unlinkSync(localPath);
res.json({
    usuario: aluno,
    token: generateToken(aluno._id)
});
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
            fotoDePerfil: faker.image.people(),
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

    return res.json({
        mensagem: "Seed de alunos completo!"
    });
});

exports.getAlunos = expressAsyncHandler(async (req, res) => {
    const alunos = await Aluno.find({}).populate('modalidade');
    res.json(alunos);
});

exports.deletarColecaoAlunos = expressAsyncHandler(async (req, res) => {
    await Aluno.deleteMany({});
    res.json("Alunos deletados.");
});