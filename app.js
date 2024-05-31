require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')


const app = express()

//Config JSON response
app.use(
    express.urlencoded({
        extended: true,
    }),
)
app.use(express.json())



//Rota pública
app.get('/', (req, res) => {
    res.status(200).json({msg: "Bem vindo a nossa API!"})
})

//Rotas da API
const FarmaciaController = require('./controllers/FarmaciaController')
app.use('/farma', FarmaciaController)

const ProdutoController = require('./controllers/ProdutosController')
app.use('/produtos', ProdutoController)

const UsuarioController = require('./controllers/UsuarioController')
app.use('/usuarios', UsuarioController)






//Credencials
const dbUser = process.env.DB_USER
const dbPassword = process.env.DB_PASS

mongoose.connect(`mongodb+srv://${dbUser}:${dbPassword}@guilherme.zmse9y1.mongodb.net/?retryWrites=true&w=majority&appName=Guilherme`).then(() => {
    app.listen(3000)
    console.log("Conectou ao banco")
}).catch((err) => console.log(err))



