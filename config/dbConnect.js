const mongoose = require('mongoose');

const dbConnect = async () => {
    try {
        console.log("NODE_ENV", process.env.NODE_ENV);
        if (process.env.NODE_ENV === "test") {
            await mongoose.connect(process.env.TEST_DATABASE, {});
        } else if (process.env.NODE_ENV === "development") {
            await mongoose.connect(process.env.DEVELOPMENT_DATABASE, {});
        } else if (process.env.NODE_ENV === "production") {
            await mongoose.connect(process.env.PRODUCTION_DATABASE, {});
        } else {
            throw new Error("variáveis de ambiente não configuradas")
        }
        console.log(`Banco de dados do tipo ${process.env.NODE_ENV} foi conectado com sucesso.`);
    } catch (err) {
        console.log('Erro ao conectar ao banco de dados.');
    }
}

module.exports = dbConnect;