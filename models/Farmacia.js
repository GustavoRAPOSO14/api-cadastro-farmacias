const mongoose = require('mongoose')

const Farmacia = mongoose.model('Farmacia', {
    cnpj: String,
    nome: String,
    email: String,
    senha: String,
    cep: String

})

module.exports = Farmacia