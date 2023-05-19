const mongoose = require('mongoose');

    try {
        console.log("NODE_ENV", process.env.NODE_ENV);
        if (process.env.NODE_ENV === "test") {
            mongoose.connect(process.env.TEST_DATABASE_MODULO_3, {});
        } else if (process.env.NODE_ENV === "development") {
            mongoose.connect(process.env.DEVELOPMENT_DATABASE, {})
                .then(() => console.log("banco de dados de desenvolvimento conectado"))
        } else if (process.env.NODE_ENV === "production") {
            mongoose.connect(process.env.PRODUCTION_DATABASE, {})
                .then(() => console.log("banco de dados de produção conectado"))
        } else {
            throw new Error("variáveis de ambiente não configuradas")
        }
    } catch (err) {
        console.log('Erro ao conectar ao banco de dados.');
    }


