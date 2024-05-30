require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')

const app = express()

//Config JSON response
app.use(express.json())

//Models
const Produtos = require("./models/Produtos")


//teste
app.get('/', (req, res) => {
    res.status(200).json({msg: 'Teste postman'})
})


//Acessando todos os produtos:
app.get("/produtos", async (req, res) => {

    try {

        const produtos = await Produtos.find()

        res.status(200).json(produtos)
        
    } catch (error) {
        res.status(500).json({error: error})
    }

})

//Acessar produto por ID
app.get("/produtos/:id", async (req, res) => {

    const id = req.params.id

    const produto = await Produtos.findById(id)

    if (!produto) {
        return res.status(404).json({msg: 'Produto inexistente'})
    }

    res.status(200).json({produto})

})


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



