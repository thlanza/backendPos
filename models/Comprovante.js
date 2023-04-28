const mongoose = require('mongoose');

const comprovanteSchema = new mongoose.Schema({
        idAluno: {
                required: [true, 'O nome do aluno é obrigatório.'],
                type: String,
        },
        urlFoto: {
            required: [true, 'O nome do aluno é obrigatório.'],
            type: String,
        }
}, {
    toJSON: { virtuals: true},
    toObject: { virtuals: true }
});

const Comprovante = mongoose.model('Comprovante', comprovanteSchema);

module.exports = Comprovante;