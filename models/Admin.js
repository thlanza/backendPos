const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validatorV = require('validator');

const adminSchema = new mongoose.Schema({
    primeiroNome: {
        required: [true, 'Primeiro nome é requerido.'],
        type: String,
    },
    sobrenome: { 
        required: [true, 'Sobrenome é requerido.'],
        type: String,
    },
    senha: {
        required: [true, 'Senha é requerido.'],
        type: String,
    },
    fotoDePerfil: {
        type: String,
        default: "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png"
    },
    email: {
        required: [true, 'Email é requerido.'],
        validate: {
            validator: function(v) {
                return validatorV.isEmail(v);
            },
            message: props => `${props.value} não é um email válido!`
        },
        type: String,
    }
});

adminSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

adminSchema.methods.senhaConfere = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;