const { loadImage, createCanvas } = require('canvas');
const { dataAleatoria } = require("../../utils/aleatorios");
const fs = require('fs');


exports.gerarComprovante = (arrayAlunos, arrayModalidades) => {

    const gerarAleatorioDoArray = (array) => array[Math.floor(Math.random() * array.length)];
    
    const width = 600
    const height = 330
    const canvas = createCanvas(width, height)
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, width, height)

    ctx.font = '30px Impact';
    ctx.fillStyle = '#000'
    ctx.fillText('Comprovante de Pagamento', 50, 100)

    ctx.font = '20px Impact';
    ctx.fillStyle = '#000'
    ctx.fillText('Valor: R$100,00', 50, 130)

    let dataInicial = new Date(2022, 4, 1);
    let dataFinal = new Date(2022, 4, 31);
    let data = dataAleatoria(dataInicial, dataFinal);

    let dia = data.getDate() < 10 ? `0${data.getDate()}` : data.getDate();
    let mes = data.getMonth() + 1 < 10 ? `0${data.getMonth() + 1}` : data.getMonth() + 1;
    let ano = data.getFullYear();

    data = `${dia}/${mes}/${ano}`;

    ctx.font = '20px Impact';
    ctx.fillStyle = '#000'
    ctx.fillText(`Data: ${data}`, 50, 160)

    let cliente = gerarAleatorioDoArray(arrayAlunos);

    ctx.font = '20px Impact';
    ctx.fillStyle = '#000'
    ctx.fillText(`Cliente: ${cliente}`, 50, 190);

    let modalidade = gerarAleatorioDoArray(arrayModalidades);

    ctx.font = '20px Impact';
    ctx.fillStyle = '#000'
    ctx.fillText(`Modalidade: ${modalidade}`, 50, 220)

    var text = ctx.measureText('Comprovante de Pagamento')
    ctx.strokeStyle = 'rgba(0,0,0,0.5)'
    ctx.beginPath()
    ctx.lineTo(50, 102)
    ctx.lineTo(50 + text.width, 102)
    ctx.stroke()

    let numero = Math.floor(Math.random() * 1001);

    let id = mapeamento[cliente];

    loadImage('./blank.jpg').then((data) => {
      ctx.drawImage(data, 340, 515, 70, 70)
      const imgBuffer = canvas.toBuffer('image/png')
      fs.writeFileSync(`./comprovante${numero}-${id}.jpg`, imgBuffer)
    })
    }