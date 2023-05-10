const express = require('express');
const { primeiroLogin, registrar, login, deletarAdmin, listaDePresenca, painelDeComprovantes, validarComprovante, seedComprovantes, criarImagensComprovantes, deletarImagens, mudancaDeMes, seedTestes, resetTestes, indiceInadimplencia, numeroAlunos } = require('../../adminControllers/admins/adminController');
const authMiddleware = require('../../middlewares/auth/authMiddeware');
const { photoUpload, redimensionar } = require('../../middlewares/upload/photoUpload');

const adminRouter = express.Router();

adminRouter.post('/primeiroLogin', primeiroLogin);
adminRouter.post('/registrar', 
    photoUpload.single('image'), 
    redimensionar('./'), 
    registrar);
adminRouter.post('/login', login);
adminRouter.delete('/administrador/:id', deletarAdmin);
adminRouter.get('/listaDePresenca', listaDePresenca);
adminRouter.get('/painelDeComprovantes', painelDeComprovantes);
adminRouter.post('/validarComprovantes', validarComprovante);
adminRouter.get('/criarImagensComprovantes/:n', criarImagensComprovantes);
adminRouter.get('/seedComprovantes', seedComprovantes);
adminRouter.get('/deletarImagens', deletarImagens);
adminRouter.get('/mudancaDeMes', mudancaDeMes);
adminRouter.get('/seedTestes', seedTestes);
adminRouter.get('/resetTestes', resetTestes);
adminRouter.get('/indice', indiceInadimplencia);
adminRouter.get('/numero', numeroAlunos);


module.exports = adminRouter;