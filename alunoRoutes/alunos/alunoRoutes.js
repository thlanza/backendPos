const express = require('express');
const { 
    matricular, 
    seedAlunos, 
    getAlunos, 
    deletarColecaoAlunos, 
    matricularGoogle, 
    logar, 
    deletarAluno,
    pdfDownload,
    cancelarInscricao,
    notificarPresenca
} = require('../../alunoControllers/alunos/alunoController');
const authMiddleware = require('../../middlewares/auth/authMiddeware');
const { photoUpload, redimensionar } = require('../../middlewares/upload/photoUpload');
const passport = require("passport");
const validarMongoId = require('../../utils/validarMongoId');
const cors = require('cors');

const alunoRouter = express.Router();


alunoRouter.get('/', getAlunos);
alunoRouter.delete('/aluno/:id', validarMongoId, deletarAluno);
alunoRouter.post('/matricular', 
    photoUpload.single('image'), 
    redimensionar('./'), 
    matricular);

alunoRouter.post('/logar', logar);

alunoRouter.post('/matricularGoogle', matricularGoogle)

alunoRouter.post('/seedAlunos', seedAlunos);
alunoRouter.delete('/deletarColecaoAlunos', deletarColecaoAlunos);
alunoRouter.delete('/cancelarInscricao', authMiddleware('usuario'), cancelarInscricao);
alunoRouter.post('/notificarPresenca', notificarPresenca);

alunoRouter.get('/download', 
cors({
    exposedHeaders: ['Content-Disposition']
}), pdfDownload);

module.exports = alunoRouter;