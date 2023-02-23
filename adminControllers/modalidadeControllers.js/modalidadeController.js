const expressAsyncHandler = require("express-async-handler");
const Modalidade = require("../../models/Modalidade");
const { aleatorioRetira, elementoAleatorio, dataAleatoria } = require("../../utils/aleatorios");
const fs = require('fs');
const PDFDocument = require('pdfkit');

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

    return res.status(201).json({
        mensagem: "Seed completo!"
    });
    
});

exports.seedModalidadesTesteCalendario = expressAsyncHandler(async (req, res) => {
    let array = [];

    let data1 = new Date(2023, 1, 1);
    let data2 = new Date(2023, 1, 2);
    let atividade1 = {
        nomeModalidade: "Natação 1",
        horario: "08:00",
        dias: ["Segunda", "Quarta"],
        dataDeCriacao: data1
    };
    let atividade2 = {
        nomeModalidade: "Yoga 1",
        horario: "09:00",
        dias: ["Terça", "Quinta"],
        dataDeCriacao: data2
    };

    array.push(atividade1);
    array.push(atividade2);
  

    await Modalidade.insertMany(array)

    return res.status(201).json({
        mensagem: "Seed Teste Calendário completo!"
    });
}); 

exports.umaModalidade = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    const modalidade = await Modalidade.findById(id);
    res.json(modalidade);
});

exports.deletarColecaoModalidades = expressAsyncHandler(async (req, res) => {
    await Modalidade.deleteMany({});

    return res.status(204).json({
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

exports.pdfDownload = expressAsyncHandler(async (req, res) => {

    var doc = new PDFDocument({bufferPages: true});

    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
    
        let pdfData = Buffer.concat(buffers);
        res.writeHead(200, {
        'Content-Length': Buffer.byteLength(pdfData),
        'Content-Type': 'application/pdf',
        'Content-disposition': 'attachment;  filename=modalidades.pdf',})
        .end(pdfData);
    
    });

    const object = await Modalidade.find({  }).lean();
    
    let string = '';
    object.forEach(element => {
        let stringModalidade = element.nomeModalidade;
        let stringModalidadeFinal = `Nome da Modalidade: ${stringModalidade} \n`;
        string += stringModalidadeFinal;
        let stringHorario = element.horario;
        let stringHorarioFinal = `Horario: ${stringHorario} \n`;
        string += stringHorarioFinal;
        let stringDias = element.dias.join(', ');
        let stringDiasFinal = `Dias: ${stringDias} \n`;
        string += stringDiasFinal;
        string += '\n'
    });

    let titulo = 'Lista das Modalidades \n\n';
    doc.font('Helvetica-Bold')
        .fontSize(14)
        .text(titulo, {
            align: 'center'
        });

    doc.font('Helvetica')
         .fontSize(12)
         .text(string);
    doc.end();
  
});

exports.deletarModalidade = expressAsyncHandler(async (req, res) => {
   const { id } = req.params;
   const modalidadeDeletada = await Modalidade.findByIdAndDelete(id); 
   res.json({"Modalidade deletada": modalidadeDeletada});
});