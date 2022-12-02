const expressAsyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const Admin = require("../../models/Admin");
const Aluno = require("../../models/Aluno");

const authMiddleware = (papel) => {
return expressAsyncHandler(async (req, res, next) => {
    let token;

    if(req?.headers?.authorization?.startsWith('Bearer')) {
        try {
            token = req?.headers?.authorization.split(" ")[1];
            if(token) {
                const decoded = jwt.verify(token, process.env.JWT_KEY);
                //encontrar os usuário pelo Id
                let usuario;
                if(papel === 'admin') {
                usuario = await Admin.findById(decoded?.id).select('-senha');
                }
                if(papel === 'usuario') {   
                usuario = await Aluno.findById(decoded?.id).select('-senha');
                }
                if (!usuario) {
                    throw new Error('Não autorizado. Token expirado. Faça login novamente.')
                }
                // anexar o objeto usuário ao request
                req.usuario = usuario;
                next();
            }
        } catch (err) {
            throw new Error('Não autorizado. Token expirado. Faça login novamente.');
        }
    } else {
        throw new Error('Não há token anexado ao header.');
    }
})};




//Redimensionamento de Imagens
exports.redimensionar = (caminho) => {
    return expressAsyncHandler(async (req, res, next) => {  
    //checar para ver se há arquivo
    if(!req.file) return next();

    req.file.filename = `perfil-${Date.now()}-${req.file.originalname}`;

    await sharp(req.file.buffer)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(path.join(`${caminho}/${req.file.filename}`))
    next();
})};

module.exports = authMiddleware;