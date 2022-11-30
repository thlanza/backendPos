const expressAsyncHandler = require("express-async-handler");
const Modalidade = require("../../models/Modalidade");

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