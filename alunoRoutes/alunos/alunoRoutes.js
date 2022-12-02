const express = require('express');
const { matricular, seedAlunos, getAlunos, deletarColecaoAlunos } = require('../../alunoControllers/alunos/alunoController');
const authMiddleware = require('../../middlewares/auth/authMiddeware');
const { photoUpload, redimensionar } = require('../../middlewares/upload/photoUpload');

const alunoRouter = express.Router();


alunoRouter.get('/', getAlunos);
alunoRouter.post('/matricular', 
    photoUpload.single('image'), 
    redimensionar('public/imagens/perfilAluno'), 
    matricular);

alunoRouter.post('/seedAlunos', seedAlunos);
alunoRouter.delete('/deletarColecaoAlunos', deletarColecaoAlunos);


module.exports = alunoRouter;