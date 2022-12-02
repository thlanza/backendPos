const mongoose = require('mongoose');

const validar = (req, res, next) => {
    const { id } = req.params;
    const ehValido = mongoose.Types.ObjectId.isValid(id);
    if (!ehValido) throw new Error("Id não é válido.")
    next();
};

module.exports = { validar };