const mongoose = require("mongoose")

const User = mongoose.model("User", {
    nomeUser: String,
    telefoneUser: String,
    senhaUser: String,
    cepUser: String,
    numeroUser: Number,
    complementoUser: String
})

module.exports = User
