const mongoose = require('mongoose')

const Produtos = mongoose.model('Produtos', {
    nome: String,
    preco: Number
})

module.exports = Produtos