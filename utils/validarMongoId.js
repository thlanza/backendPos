const mongoose = require('mongoose');

const validarMongoIdMetodo = (id) => {
    const ehValido = mongoose.Types.ObjectId.isValid(id);
    if (!ehValido) throw new Error('Esse id não é válido');   
}

const validarMongoIdMiddleware = (req, res, next) => {
    const { id } = req.params;
    validarMongoIdMetodo(id);
    next();
}

module.exports = { validarMongoIdMetodo, validarMongoIdMiddleware };