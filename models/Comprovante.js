const mongoose = require('mongoose');

const comprovanteSchema = new mongoose.Schema({
        idAluno: {
                required: [true, 'O nome do aluno é obrigatório.'],
                type: String,
        },
        urlFoto: {
            required: [true, 'A url é obrigatória.'],
            type: String,
        },
        mes: {
            required: [true, 'O mês é obrigatório.'],
            type: Number
        },
        ano: {
            required: [true, 'O ano é obrigatório.'],
            type: Number
        }
}, {
    toJSON: { virtuals: true},
    toObject: { virtuals: true }
});

const Comprovante = mongoose.model('Comprovante', comprovanteSchema);

module.exports = Comprovante;