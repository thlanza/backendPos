const mongoose = require('mongoose');
const validatorV = require('validator');
const bcrypt = require('bcryptjs');
const options = { 
    discriminatorKey: 'tipo',
    collection: 'baseUsuarios' 
};


const baseSchema = new mongoose.Schema({
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
        unique: true,
        validate: {
            validator: function(v) {
                return validatorV.isEmail(v);
            },
            message: props => `${props.value} não é um email válido!`
        },
        type: String,
    },
}, options);

baseSchema.pre('save', async function(next) {
    if (!this.isModified('senha')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.senha = await bcrypt.hash(this.senha, salt);
    next();
});

baseSchema.pre('insertMany', async function(next, docs) {
    if (Array.isArray(docs) && docs.length) {
        const usuariosHasheados = docs.map(async (user) => {
            return await new Promise((resolve, reject) => {
            bcrypt.genSalt(10).then((salt) => {
                let senha = user.senha.toString();
                bcrypt.hash(senha, salt).then(hash => {
                    user.senha = hash;
                    resolve(user)
                }).catch(e => {
                    reject(e);
                })
            }).catch((e) => {
                reject(e);
            })   
        });
    });
        docs = await Promise.all(usuariosHasheados); 
        next();
    } else {
        return next(new Error("Lista de usuários não deve estar vazia"))
    }
});

baseSchema.methods.senhaConfere = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.senha);
};

const Base = mongoose.model('Base', baseSchema);

module.exports = Base;