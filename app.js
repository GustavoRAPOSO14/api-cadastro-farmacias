require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')

const app = express()

//Config JSON response
app.use(express.json())

//Models
const Produtos = require("./models/Produtos")

//Registrar o produto:
app.post("/auth/register/produto", async(req, res) => {
    const{nome, preco, quantidade} = req.body

    //Validações:
    if (!nome){
        return res.status(422).json({msg: "O nome do produto é obrigatório!"})
    }

    if (!preco){
        return res.status(422).json({msg: "O preço do produto é obrigatório!"})
    }

    if (!quantidade){
        return res.status(422).json({msg: "A quantidade de produto é obrigatória!"})
    }

    const produto = new Produtos({
        nome,
        preco,
        quantidade
    })

    try {
        await produto.save()

        res.status(201).json({msg: "Produto cadastrado com sucesso!"})
    } catch (error) {
        console.log(error)
        res.status(500).json({msg:"Algo deu errado. Tente novamente mais tarde!"})
    }
})

//Credencials
const dbUser = process.env.DB_USER
const dbPassword = process.env.DB_PASS

mongoose.connect(
    `mongodb+srv://${dbUser}:${dbPassword}@guilherme.zmse9y1.mongodb.net/?retryWrites=true&w=majority&appName=Guilherme`
)
.then(() => {
    app.listen(3002)
    console.log("Conectou ao banco")
}).catch((err) => console.log(err))



