const express = require('express');
const { primeiroLogin, registrar, login, deletarAdmin, listaDePresenca } = require('../../adminControllers/admins/adminController');
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

module.exports = adminRouter;