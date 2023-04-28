const express = require('express');
const { primeiroLogin, registrar, login, deletarAdmin, listaDePresenca, painelDeComprovantes, validarComprovante, deletarFoto } = require('../../adminControllers/admins/adminController');
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
adminRouter.get('/deletarFoto', deletarFoto);

module.exports = adminRouter;