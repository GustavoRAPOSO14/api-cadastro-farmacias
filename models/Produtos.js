const mongoose = require('mongoose')

const Produtos = mongoose.model('Produtos', {
    EAN: String,
    nome: String,
    preco: Number,
    quantidade: String,
    dosagem: String

})

module.exports = Produtos