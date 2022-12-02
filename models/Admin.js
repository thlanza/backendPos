const { default: mongoose } = require('mongoose');
const Base = require('./BaseUsuario');

const Admin = Base.discriminator('Admin', new mongoose.Schema());

module.exports = mongoose.model('Admin');