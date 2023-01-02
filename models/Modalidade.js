const mongoose = require('mongoose');
const moment = require('moment');

const modalidadeSchema = new mongoose.Schema({
    nomeModalidade: {
        required: [true, 'O nome da modalidade é requerido.'],
        type: String,
    },
    horario: {
        type: String,
        required: [true, 'O horário é obrigatório'],
        validate: {
            validator: function(horario) {
                return moment(horario, 'HH:mm', true).isValid();
            }
        }
    },
    dias: [{
        
                type: String,
                required: [true, "Dias são obrigatórios"],
                validate: {
                    validator: async function(element) {
                        const modelo = await Modalidade.findById(this?.id);
                        let array;
                        if (modelo) {
                            console.log("modelo", modelo);
                            console.log("array", this?._update['$set'].dias);
                            array = this?._update['$set'].dias;
                        } else {
                            array = this?.dias;
                        }
                        let condicao1 = ["Segunda", "Terça", "Quarta", "Quinta",
                             "Sexta", "Sábado", "Domingo"].includes(element);     
                        let condicao2 = new Set(array).size === array.length;
                        return condicao1 && condicao2;
                    }
                }     
    }],
    dataDeCriacao: {
        type: Date,
        default: () => Date.now()
    }
}, {
    toJSON: { virtuals: true},
    toObject: { virtuals: true }
});

modalidadeSchema.virtual("alunos", {
    ref: 'Aluno',
    localField: '_id',
    foreignField: 'modalidade',
    justOne: false
});

const Modalidade = mongoose.model('Modalidade', modalidadeSchema);

module.exports = Modalidade;