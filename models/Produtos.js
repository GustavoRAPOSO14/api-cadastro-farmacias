const mongoose = require('mongoose')

const Produtos = mongoose.model('Produtos', {
    farmacia:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Farmacia'
    },
    nome: String,
    nome_quimico: String,
    preco: Number,
    quantidade: Number,
    validade: String,
    lote: String,
    label: String,
    imagem_url: String
})

module.exports = Produtos