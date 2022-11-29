const express = require('express');
const { primeiroLogin, registrar, login } = require('../../adminControllers/admins/adminController');
const { photoUpload, redimensionar } = require('../../middlewares/upload/photoUpload');

const adminRouter = express.Router();

adminRouter.post('/primeiroLogin', primeiroLogin);
adminRouter.post('/registrar', photoUpload.single('image'), redimensionar, registrar);
adminRouter.post('/login', login);

module.exports = adminRouter;