const expressAsyncHandler = require("express-async-handler");
const Aluno = require("../models/Aluno");

exports.dadosParaGraficoAlunosInscricao = expressAsyncHandler(async (req, res) => {      

    const dadosAlunos = await Aluno.find({ });
    const meses = [];

    dadosAlunos.forEach(element => {
        const date = new Date(element.dataDeInscricao);
        const month = date.toLocaleString('default', { month: 'long'});
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
            [element[0]]: element[1]
        })
    });

    res.json(contagemArrayOfObjects);

    });