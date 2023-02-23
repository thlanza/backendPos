const mongoose = require('mongoose');

const validarMongoId = (req, res, next) => {
    const { id } = req.params;
    const ehValido = mongoose.Types.ObjectId.isValid(id);
    if (!ehValido) throw new Error('Esse id não é válido');
    next();
}

module.exports = validarMongoId