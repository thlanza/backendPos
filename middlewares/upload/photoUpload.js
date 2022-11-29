const expressAsyncHandler = require('express-async-handler');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');

//storage
const multerStorage = multer.memoryStorage();

caminho = 'public/imagens/perfil/';

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
exports.redimensionar = expressAsyncHandler(async (req, res, next) => {  
    //checar para ver se há arquivo
    if(!req.file) return next();

    req.file.filename = `perfil-${Date.now()}-${req.file.originalname}`;

    await sharp(req.file.buffer)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(path.join(`${caminho}/${req.file.filename}`))
    next();
});

exports.photoUpload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
});

