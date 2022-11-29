const mongoose = require('mongoose');

const dbConnect = async () => {
    try {
        await mongoose.connect(process.env.DATABASE, {});
        console.log('Banco de dados foi conectado com sucesso.');
    } catch (err) {
        console.log('Erro ao conectar ao banco de dados.');
    }
}

module.exports = dbConnect;