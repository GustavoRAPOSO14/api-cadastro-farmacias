const mongoose = require("mongoose")

const User = mongoose.model("User", {
    nomeUser: String,
    mailUser: String,
    senhaUser: String,
    cepUser: String,
    numeroUser: Number,
    complementoUser: String
})

module.exports = User
