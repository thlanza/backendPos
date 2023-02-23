const express = require('express');
const { primeiroLogin, registrar, login, deletarAdmin } = require('../../adminControllers/admins/adminController');
const { photoUpload, redimensionar } = require('../../middlewares/upload/photoUpload');

const adminRouter = express.Router();

adminRouter.post('/primeiroLogin', primeiroLogin);
adminRouter.post('/registrar', 
    photoUpload.single('image'), 
    redimensionar('public/imagens/perfilAdmin'), 
    registrar);
adminRouter.post('/login', login);
adminRouter.delete('/administrador/:id', deletarAdmin);

module.exports = adminRouter;