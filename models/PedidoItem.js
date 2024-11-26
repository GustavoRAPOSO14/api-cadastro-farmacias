const mongoose = require('mongoose')

const PedidoItem = mongoose.model('PedidoItem', {
    quantidade: {
        type: Number,
        required:true
    },
    product:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Produtos'
    }
})

module.exports = PedidoItem