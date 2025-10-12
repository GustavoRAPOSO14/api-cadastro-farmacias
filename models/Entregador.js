const mongoose = require("mongoose")

const Entregador = mongoose.model("Entregadores", {
    cpf: String,
    email: String,
    nome: String,
    regiao: String,
    senha: String,
})

module.exports = Entregador