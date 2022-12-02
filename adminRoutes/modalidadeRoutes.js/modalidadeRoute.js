const express = require('express');
const { criarModalidade, getModalidades, seedModalidades, deletarColecaoModalidades, deletarModalidade, atualizarModalidade } = require('../../adminControllers/modalidadeControllers.js/modalidadeController');
const authMiddleware = require('../../middlewares/auth/authMiddeware');
const { validar } = require('../../middlewares/validar');

const modalidadeRouter = express.Router();

modalidadeRouter.post('/', authMiddleware('admin'), criarModalidade);
modalidadeRouter.get('/', authMiddleware('admin'), getModalidades);
modalidadeRouter.post('/seed', seedModalidades);
modalidadeRouter.delete('/modalidade/:id', authMiddleware('admin'), validar, deletarModalidade);
modalidadeRouter.delete('/deletarColecaoModalidades', deletarColecaoModalidades);
modalidadeRouter.put('/modalidade/:id', authMiddleware('admin'), validar, atualizarModalidade);

module.exports = modalidadeRouter;