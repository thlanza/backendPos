const express = require('express');
const { criarModalidade, getModalidades, seedModalidades, deletarColecaoModalidades, deletarModalidade, atualizarModalidade, umaModalidade } = require('../../adminControllers/modalidadeControllers.js/modalidadeController');
const authMiddleware = require('../../middlewares/auth/authMiddeware');
const { validar } = require('../../middlewares/validar');

const modalidadeRouter = express.Router();

modalidadeRouter.post('/', authMiddleware('admin'), criarModalidade);
modalidadeRouter.get('/', getModalidades);
modalidadeRouter.post('/seed', seedModalidades);
modalidadeRouter.delete('/modalidade/:id', authMiddleware('admin'), validar, deletarModalidade);
modalidadeRouter.delete('/deletarColecaoModalidades', deletarColecaoModalidades);
modalidadeRouter.put('/modalidade/:id', authMiddleware('admin'), validar, atualizarModalidade);
modalidadeRouter.get('/modalidade/:id', validar, umaModalidade);

module.exports = modalidadeRouter;