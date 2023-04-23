const express = require('express');
const { dadosParaGraficoAlunosInscricao, dadosParaGraficoModalidades, dadosParaGraficoInadimplencia, dadosParaGraficoMesesInadimplencia } = require('../estatisticaControllers/estatisticaController');
const authMiddleware = require('../middlewares/auth/authMiddeware');

const estatisticaRouter = express.Router();

estatisticaRouter.get('/dadosParaGraficoAlunosInscricao', dadosParaGraficoAlunosInscricao);
estatisticaRouter.get('/dadosParaGraficoModalidades', dadosParaGraficoModalidades);
estatisticaRouter.get('/dadosParaGraficoInadimplencia', dadosParaGraficoInadimplencia);
estatisticaRouter.get('/dadosParaGraficoMesesInadimplencia', dadosParaGraficoMesesInadimplencia);

// estatisticaRouter.get('/dadosParaGraficoAlunosInscricao', authMiddleware('admin'), dadosParaGraficoAlunosInscricao);

module.exports = estatisticaRouter

