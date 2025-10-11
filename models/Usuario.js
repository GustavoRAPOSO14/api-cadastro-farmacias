const mongoose = require("mongoose")

const User = mongoose.model("Usuarios", {
    // cpf: String,
    googleId: String,
    nome: String,
    email: String,
    telefone: String,
    senha: String,
    // cep: String,
})

module.exports = User