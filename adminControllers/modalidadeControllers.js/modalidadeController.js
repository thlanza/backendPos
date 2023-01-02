const expressAsyncHandler = require("express-async-handler");
const Modalidade = require("../../models/Modalidade");
const { aleatorioRetira, elementoAleatorio, dataAleatoria } = require("../../utils/aleatorios");

exports.criarModalidade = expressAsyncHandler(async (req, res) => {
    const { nomeModalidade, horario, dias } = req?.body;
    const modalidade = await Modalidade.create({
        nomeModalidade,
        horario,
        dias
    }); 
    return res.json({
        modalidade
    });
});

exports.getModalidades = expressAsyncHandler(async (req, res) => {
    const modalidades = await Modalidade.find({}).populate('alunos');
    res.json(modalidades);
});

exports.seedModalidades = expressAsyncHandler(async (req, res) => {

    let array = [];

    let arrayModalidades = [
        "Natação 1",
        "Natação 2",
        "Yoga 1",
        "Yoga 2",
        "Musculação 1",
        "Musculação 2",
        "Ginástica 1",
        "Ginástica 2",
        "Spinning 1",
        "Spinning 2"
    ];
    let arrayHorarios = [
        "08:00",
        "09:00",
        "10:30",
        "11:30",
        "14:00",
        "15:30",
        "16:30",
        "18:00",
        "19:00",
        "20:30"
    ];
    let arrayDias = [
        ["Segunda", "Quarta"],
        ["Terça", "Quinta"],
        ["Quarta", "Sexta"]
    ]
    for (let i = 0; i < 10; i++) {
        dataInicial = new Date(2022, 3, 1);
        dataFinal = new Date(2022, 11, 31);
        array.push({
            nomeModalidade: aleatorioRetira(arrayModalidades),
            horario: elementoAleatorio(arrayHorarios),
            dias: elementoAleatorio(arrayDias),
            dataDeCriacao: dataAleatoria(dataInicial, dataFinal)
        });
        console.log(arrayModalidades);
    }

  
    await Modalidade.insertMany(array)

    return res.json({
        mensagem: "Seed completo!"
    });
    
});

exports.umaModalidade = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    const modalidade = await Modalidade.findById(id);
    res.json(modalidade);
});

exports.deletarColecaoModalidades = expressAsyncHandler(async (req, res) => {
    await Modalidade.deleteMany({});

    return res.json({
        mensagem: "Banco Deletado!"
    });
});

exports.atualizarModalidade = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    const { nomeModalidade, horario, dias } = req?.body;
    const modalidadeAtualizada = await Modalidade.findByIdAndUpdate(id, {
        nomeModalidade,
        horario,
        dias
    }, {
        new: true
    });
    res.json(modalidadeAtualizada);
});

exports.deletarModalidade = expressAsyncHandler(async (req, res) => {
   const { id } = req.params;
   const modalidadeDeletada = await Modalidade.findByIdAndDelete(id); 
   res.json({"Modalidade deletada": modalidadeDeletada});
});