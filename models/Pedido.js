const mongoose = require('mongoose')


const Pedido = mongoose.model('Pedido', {
    itensPedido: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PedidoItem',
        required:true
    }],
    endereco1: String,
    endereco2: String,
    city: String,
    cep: String,
    pais: String,
    telefone: String,
    status: {
        type:String,
        required: true,
        default: 'Pendente',
    },
    precoTotal: Number,
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuarios'
    },
    dataPedido:{
        type: Date,
        default: Date.now,
    },

})

module.exports = Pedido