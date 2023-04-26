const mongoose = require('mongoose');

const presencaSchema = new mongoose.Schema({
    presencas: [
        { 
            nomeAluno: {
            required: [true, 'O nome da aluno é requerido.'],
            type: String,
            },
            presenca: {
                type: String,
                enum: ['presente', 'faltou', 'não informado'],
                required: [true, 'presença é obrigatório.']
            },   
        },
    ],
        dataDaPresenca: {
            type: String,
            default: 'não informado'
        },
            nomeModalidade: {
                required: [true, 'O nome da modalidade é requerido.'],
                type: String,
        },
}, {
    toJSON: { virtuals: true},
    toObject: { virtuals: true }
});

const Presenca = mongoose.model('Presenca', presencaSchema);

module.exports = Presenca;