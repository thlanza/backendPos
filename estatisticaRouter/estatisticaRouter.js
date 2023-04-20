const express = require('express');
const { dadosParaGraficoAlunosInscricao } = require('../estatisticaControllers/estatisticaController');
const authMiddleware = require('../middlewares/auth/authMiddeware');

const estatisticaRouter = express.Router();

estatisticaRouter.get('/dadosParaGraficoAlunosInscricao', dadosParaGraficoAlunosInscricao);

// estatisticaRouter.get('/dadosParaGraficoAlunosInscricao', authMiddleware('admin'), dadosParaGraficoAlunosInscricao);

module.exports = estatisticaRouter

