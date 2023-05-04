const expressAsyncHandler = require('express-async-handler');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');

//storage
const multerStorage = multer.memoryStorage();

//checagem de tipo de arquivo
const multerFilter = (req, file, cb) => {
    //check file type
    if (file.mimetype.startsWith("image")) {
        cb(null, true);
    } else {
        //rejected files
        cb({
            message: 'Tipo de arquivo não suportado.'
        }, false)
    }
};

//Redimensionamento de Imagens
exports.redimensionar = (caminho, comprovante = '') => {
    return expressAsyncHandler(async (req, res, next) => {  
    //checar para ver se há arquivo
    if(!req.file) return next();

    req.file.filename = `perfil-${Date.now()}-${req.file.originalname}`;

    if (comprovante === 'comprovante') {
        await sharp(req.file.buffer)
        .resize(600, 300)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(path.join(`${caminho}/${req.file.filename}`))
        next();
        return;
    }
    await sharp(req.file.buffer)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(path.join(`${caminho}/${req.file.filename}`))
    next();
    return;
})};

exports.photoUpload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
});

