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
const { loadImage, createCanvas } = require('canvas');
const { dataAleatoria, elementoAleatorio } = require("../../utils/aleatorios");
const path = require('path');
const { faker } = require('@faker-js/faker');
const { limparDir } = require("../../utils/limparDir");

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

exports.numeroAlunos = expressAsyncHandler(async (req, res) => {
   const alunos = await Aluno.find({}); 
   const numero = alunos.length;
   return res.json({"numero": numero});
});

exports.indiceInadimplencia = expressAsyncHandler(async (req, res) => {
    const alunos = await Aluno.find({}); 
    const numeroAlunos = alunos.length;
    const inadimplentes = await Aluno.find({ inadimplente: true });
    const numeroInadimplentes = inadimplentes.length;
    let indice;
    if(numeroAlunos === 0) {
        indice = 0;
        return res.json({"índice": indice })
    }
    indice = numeroInadimplentes / numeroAlunos * 100;
    return res.json({"indice": indice});
 });

exports.registrar = expressAsyncHandler(async (req, res) => {
    //Checar se o admin já existe
    const adminExiste = await Admin.findOne({ email: req?.body?.email });
    if (adminExiste) throw new Error("Admin já existe.");

    //1. Caminho local para a imagem
    const localPath = `./${req.file.filename}`;
    //2. Fazer upload para o serviço Cloudinary
    console.log("localPath", localPath);
    const { url } = await cloudinaryUploadImage(localPath);
    console.log("url", url);
    const admin = await Admin.create({
        primeiroNome: req?.body?.primeiroNome,
        sobrenome: req?.body?.sobrenome,
        email: req?.body?.email,
        senha: req?.body?.senha,
        fotoDePerfil: url
    });
    //3. Deletar a imagem no servidor local
    limparDir();
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
        const aluno = await Aluno.findById(idAluno);
        if (aluno.mesesInadimplente === 1 || 0) {
            const atualizacao = {
                inadimplente: false,
                mesesInadimplente: 0
            }
            await deletar(comprovante.urlFoto);

            await Aluno.findByIdAndUpdate(idAluno, atualizacao, {
                returnOriginal: false
            });
        
            await Comprovante.deleteOne({ _id: idComprovante })
            return res.status(200).json({ comprovante: "válido" });
        };
        if (aluno.mesesInadimplente > 1) {
            const atualizacao = {
                mesesInadimplente: aluno.mesesInadimplente - 1
            };

            await deletar(comprovante.urlFoto);

            await Aluno.findByIdAndUpdate(idAluno, atualizacao, {
                returnOriginal: false
            });
        
            await Comprovante.deleteOne({ _id: idComprovante })
            return res.status(200).json({ comprovante: "válido" });
        }
    }
    if (valido==="invalido") {
        await deletar(comprovante.urlFoto);

        await Comprovante.deleteOne({ _id: idComprovante })
        return res.status(200).json({ comprovante: "inválido" });
    }
    throw new Error("Deve ser válido ou inválido");
});


exports.seedComprovantes = expressAsyncHandler(async (req, res) => { 

    let caminhos = [];
   
    const uploadDir = function(myPath, bucketName) {

    
        function walkSync(currentDirPath, callback) {
            fs.readdirSync(currentDirPath).forEach(function (name) {
                var filePath = path.join(currentDirPath, name);
                var stat = fs.statSync(filePath);
                if (stat.isFile()) {
                    callback(filePath, stat);
                } 
            });
        }
    
        walkSync(myPath, function(filePath, stat) {
            filePath = path.extname(filePath).toLowerCase() === '.jpg' ? filePath : '';
            if (filePath !== '') caminhos.push(filePath);
        });
    };
    
 
    uploadDir(path.resolve('./'));
    caminhos.forEach(async (element) => {
        let array = element.split('-');
        let idExtensao = array[array.length - 1];
        let [id, _] = idExtensao.split('.');
        const { url } = await cloudinaryUploadImage(element);
        await Comprovante.create({
            idAluno: id,
            urlFoto: url,
            mes: 4,
            ano: 2022
        });
        fs.unlink(element, function(err) {
            if(err && err.code == 'ENOENT') {
                console.info("Arquivo não existe, não será removido.");
            } else if (err) {
                console.error("Erro ocorreu enquanto arquivo era removido.");
            } else {
                console.info(`Removido.`);
            }
        });
    });
    return res.status(200).json("seed completo");
});

exports.deletarImagens = expressAsyncHandler(async (req, res) => {
    let caminhos = [];
    const percorrer = function(myPath, bucketName) {

    
        function walkSync(currentDirPath, callback) {
            fs.readdirSync(currentDirPath).forEach(function (name) {
                var filePath = path.join(currentDirPath, name);
                var stat = fs.statSync(filePath);
                if (stat.isFile()) {
                    callback(filePath, stat);
                } 
            });
        }
    
        walkSync(myPath, function(filePath, stat) {
            filePath = path.extname(filePath).toLowerCase() === '.jpg' ? filePath : '';
            if (filePath !== '') caminhos.push(filePath);
            console.log(filePath);
        });
    };
    percorrer(path.resolve('./'));
    res.status(204).json("pronto");
});


exports.criarImagensComprovantes = expressAsyncHandler(async (req, res) => { 
    const numeroImagens = req.params.n;
    const alunos = await Aluno.find();
    const nomeAlunos = alunos.map(element => {
        let nome_completo = element.primeiroNome + ' ' + element.sobrenome;
        return nome_completo;
    });
    const alunosLean = await Aluno.find().lean();

    let mapeamento = alunosLean.reduce((a, v) => {
        let nome = v.primeiroNome + ' ' + v.sobrenome;
        let id = String(v._id);
        return({ ...a, [nome] : id})
    }, {});
    const modalidades = await Modalidade.find();
    const nomeModalidades = modalidades.map(element => element.nomeModalidade);

    const gerarAleatorioDoArray = (array) => array[Math.floor(Math.random() * array.length)];

    const gerarComprovante = async (arrayAlunos, arrayModalidades) => {
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

        async function loadImageAndSave(id, numero, mes, ano) {
            const localImage = await loadImage('./blank.jpg');
            ctx.drawImage(localImage, 340, 515, 70, 70);
            const imgBuffer = canvas.toBuffer('image/png');
            const diretorio = `./comprovante${numero}-${id}.jpg`
            fs.writeFileSync(diretorio, imgBuffer);
            const { url } = await cloudinaryUploadImage(diretorio);
            await Comprovante.create({
                idAluno: id,
                urlFoto: url,
                mes,
                ano
            });   
            limparDir();
        }

        await loadImageAndSave(id, numero, 4, 2022);
    
        }

    for (let i = 0; i < numeroImagens; i++) {
        gerarComprovante(nomeAlunos, nomeModalidades);
    }
    
    return res.status(200).json("pronto");
});

exports.mudancaDeMes = expressAsyncHandler(async (req, res) => {
    const alunos = await Aluno.find({ });
    alunos.forEach(async aluno => {
        let inadimplente = aluno.inadimplente;
        if (inadimplente === false) {
            aluno.inadimplente = true;
            aluno.mesesInadimplente = 0;
            await aluno.save();
        } else {
            let mesesInadimplente = aluno.mesesInadimplente;
            mesesInadimplente++;
            aluno.mesesInadimplente = mesesInadimplente;
            await aluno.save();
        }
    });
    res.status(200).json("um mês se passou, ajustes foram feitos");
});

exports.seedTestes = expressAsyncHandler(async (req, res) => {
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
        nomeModalidade: "Yoga 2",
        horario: "09:00",
        dias: ["Terça", "Quinta"],
        dataDeCriacao: data2
    };

    array.push(atividade1);
    array.push(atividade2);
  

    await Modalidade.insertMany(array);

    const modalidades = await Modalidade.find({});
    const ids = modalidades.map(element => element._id.toString());

    await Aluno.create({
        primeiroNome: 'Thales',
        sobrenome: 'Lanza',
        email: 'thaleslanza@gmail.com',
        senha: 'senha1',
        fotoDePerfil: faker.image.avatar(640, 480, true),
        modalidade: elementoAleatorio(ids),
        inadimplente: false,
        mesesInadimplente: 0
    });

    await Aluno.create({
        primeiroNome: 'Zé',
        sobrenome: 'das Couve',
        email: 'zedascouve@gmail.com',
        senha: 'senha1',
        fotoDePerfil: faker.image.avatar(640, 480, true),
        modalidade: elementoAleatorio(ids),
        inadimplente: true,
        mesesInadimplente: 1
    });

    await Aluno.create({
        primeiroNome: 'Bim',
        sobrenome: 'da Ambulância',
        email: 'bim@gmail.com',
        senha: 'senha1',
        fotoDePerfil: faker.image.avatar(640, 480, true),
        modalidade: elementoAleatorio(ids),
        inadimplente: true,
        mesesInadimplente: 2
    });

    const alunos = await Aluno.find({});
    const idsAlunos = alunos.map(element => element._id.toString());

    let enumPresencas =  ['presente', 'faltou', 'não informado'];

    let arrayPresencas = alunos.map(aluno =>  {  
        let nome = `${aluno.primeiroNome} ${aluno.sobrenome}`
        return ({
        'nomeAluno': nome,
        'presenca': elementoAleatorio(enumPresencas)
    })});


   
    for (let i = 0; i < 6; i++) {
        await Comprovante.create({
            idAluno: elementoAleatorio(idsAlunos),
            urlFoto: faker.image.avatar(640, 480, true),
            mes: 4,
            ano: 2022
        });   
    }

    await Presenca.create({
        presencas: arrayPresencas,
        dataDaPresenca: '02/02/2022',
        nomeModalidade: 'Natação 1'
    });



    return res.json("pronto")
});

exports.resetTestes = expressAsyncHandler(async (req, res) => {
    await Modalidade.deleteMany({});
    await Aluno.deleteMany({});
    await Comprovante.deleteMany({});
    await Presenca.deleteMany({});    
    return res.json("pronto")
});