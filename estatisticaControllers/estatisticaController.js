const expressAsyncHandler = require("express-async-handler");
const Aluno = require("../models/Aluno");
const Modalidade = require("../models/Modalidade");

exports.dadosParaGraficoAlunosInscricao = expressAsyncHandler(async (req, res) => {      

    const dadosAlunos = await Aluno.find({ });
    const meses = [];

    dadosAlunos.forEach(element => {
        const date = new Date(element.dataDeInscricao);
        const month = date.toLocaleString('pt-BR', { month: 'long'});
        meses.push(month)              
    });

   
    const contagem = {};
    meses.forEach((el) => {
        contagem[el] = contagem[el] ? (contagem[el] + 1) : 1
    });

    function ordenarPorMes(arr) {
        let meses = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
        let mesesPresentes = [];
        arr.forEach(element => {
            mesesPresentes.push(element[0])
        });
        let diferenca = meses.filter(x => mesesPresentes.indexOf(x) === -1);
        let nomeMeses = {
            "janeiro": 1,
            "fevereiro": 2,
            "março": 3,
            "abril": 4,
            "maio": 5,
            "junho": 6,
            "julho": 7,
            "agosto": 8,
            "setembro": 9,
            "outubro": 10,
            "novembro": 11,
            "dezembro": 12
        }
        diferenca.forEach(element => {
            arr.push([element, 0])
        })
        arr.sort(function(a, b) {
            return nomeMeses[a[0]] - nomeMeses[b[0]];
        })
        
    }

    let contagemArray = [];
    Object.keys(contagem).forEach(element => contagemArray.push([element, contagem[element]]));


    ordenarPorMes(contagemArray);
 

    let contagemArrayOfObjects = [];

    contagemArray.forEach(element => {
        contagemArrayOfObjects.push({
            "chave": element[0], "valor": element[1]
        })
    });

    res.json(contagemArrayOfObjects);

    });

exports.dadosParaGraficoModalidades = expressAsyncHandler(async (req, res) => {      

    const dadosModalidades = await Modalidade.find({ }).populate("alunos");

    let contagemArray = [];

    dadosModalidades.forEach(element => {
           let alunos = element.alunos;
           let numeroAlunos = alunos.length;
           contagemArray.push({
            "chave": element.nomeModalidade, "valor": numeroAlunos
           })     
    });


    res.json(contagemArray);

    });

exports.dadosParaGraficoInadimplencia = expressAsyncHandler(async (req, res) => {      

    const dadosAlunos = await Aluno.find({ });


    dadosAlunos.forEach(element => {
        console.log(element)         
    });

    let inadimplente = 0;
    let emDia = 0;

    dadosAlunos.forEach(element => {
        if (element.inadimplente === true) {
            inadimplente++;
        } else {
            emDia++;
        }           
    });

    let contagemArray = [];
    contagemArray.push({
        "chave": "inadimplente", "valor": inadimplente
    });
    contagemArray.push({
        "chave": "em dia", "valor": emDia
    });

    res.json(contagemArray);;

    });

exports.dadosParaGraficoMesesInadimplencia = expressAsyncHandler(async (req, res) => {      

    const dadosAlunos = await Aluno.find({ });

    let mesesInadimplente = []

    dadosAlunos.forEach(element => {
        mesesInadimplente.push(element.mesesInadimplente)          
    });

    const contagem = {};
    mesesInadimplente.forEach((el) => {
        contagem[el] = contagem[el] ? (contagem[el] + 1) : 1
    });
    let contagemArray = [];
    Object.keys(contagem).forEach(element => {
        let mes = element <= 1 ? "mês": "meses";
        contagemArray.push({chave: `${element} ${mes} inadimplente`, valor: contagem[element]})
    })

    res.json(contagemArray);;

    });