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
                    validator: function(element) {
                        let array = this.dias;
                        let condicao1 = ["Segunda", "Terça", "Quarta", "Quinta",
                             "Sexta", "Sábado", "Domingo"].includes(element);     
                        let condicao2 = new Set(array).size === array.length;
                        return condicao1 && condicao2;
                    }
                }     
    }],
});

const Modalidade = mongoose.model('Modalidade', modalidadeSchema);

module.exports = Modalidade;