const express = require('express');
const { dadosParaGraficoAlunosInscricao, dadosParaGraficoModalidades } = require('../estatisticaControllers/estatisticaController');
const authMiddleware = require('../middlewares/auth/authMiddeware');

const estatisticaRouter = express.Router();

estatisticaRouter.get('/dadosParaGraficoAlunosInscricao', dadosParaGraficoAlunosInscricao);
estatisticaRouter.get('/dadosParaGraficoModalidades', dadosParaGraficoModalidades);

// estatisticaRouter.get('/dadosParaGraficoAlunosInscricao', authMiddleware('admin'), dadosParaGraficoAlunosInscricao);

module.exports = estatisticaRouter

