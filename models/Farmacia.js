const mongoose = require('mongoose')

const Farmacia = mongoose.model('Farmacia', {
    cnpj: String,
    nome: String,
    rede: String,
    email: String,
    senha: String,
    rua: String,
    bairro: String,
    numero: String,
    cep: String,
    uf: String,
    cidade: String
})

module.exports = Farmacia