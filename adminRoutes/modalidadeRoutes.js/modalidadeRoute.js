const express = require('express');
const { criarModalidade, 
    getModalidades, 
    seedModalidades, 
    deletarColecaoModalidades, 
    deletarModalidade, 
    atualizarModalidade, 
    umaModalidade,
    seedModalidadesTesteCalendario,
    pdfDownload 
} = require('../../adminControllers/modalidadeControllers.js/modalidadeController');
const authMiddleware = require('../../middlewares/auth/authMiddeware');
const { validar } = require('../../middlewares/validar');
const cors = require('cors');

const modalidadeRouter = express.Router();

modalidadeRouter.post('/', authMiddleware('admin'), criarModalidade);
modalidadeRouter.get('/', getModalidades);
modalidadeRouter.get('/seed', seedModalidades);
modalidadeRouter.get('/seedModalidadesCalendario', seedModalidadesTesteCalendario);
modalidadeRouter.delete('/modalidade/:id', authMiddleware('admin'), validar, deletarModalidade);
modalidadeRouter.get('/deletarColecaoModalidades', deletarColecaoModalidades);
modalidadeRouter.put('/modalidade/:id', authMiddleware('admin'), validar, atualizarModalidade);
modalidadeRouter.get('/modalidade/:id', validar, umaModalidade);
modalidadeRouter.get('/download', 
cors({
    exposedHeaders: ['Content-Disposition']
}), pdfDownload);

module.exports = modalidadeRouter;