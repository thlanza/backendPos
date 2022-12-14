const { default: mongoose } = require('mongoose');
const Base = require('./BaseUsuario');

const Aluno = Base.discriminator('Aluno', new mongoose.Schema({
    modalidade: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Modalidade',
                required: [true, 'Modalidade é requerido.']
            },
            inadimplente: {
                type: Boolean,
                default: false
            },
            mesesInadimplente: {
                type: Number,
                default: 0
            }
}));

module.exports = mongoose.model('Aluno');



