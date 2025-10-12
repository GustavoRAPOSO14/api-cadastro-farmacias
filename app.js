require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const passport = require('passport')
const session = require('express-session')


const app = express()

// app.use(cors({
//     origin: 'http://localhost:3001', // URL do seu front-end
//     credentials: true, // Permite enviar cookies com a requisição
//   }));

app.use(cors())
app.options("*", cors())

const port = process.env.PORT || 3000;

//Config JSON response
app.use(
    express.urlencoded({
        extended: true,
    }),
)
app.use(express.json())


app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false}
}))

app.use(passport.initialize())
app.use(passport.session())



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

const PedidoController = require('./controllers/PedidoController')
app.use('/pedidos', PedidoController)

const EntregadorController = require('./controllers/EntregadorController')
app.use('/entregadores', EntregadorController)






//Credencials
const dbUser = process.env.DB_USER
const dbPassword = process.env.DB_PASS

mongoose.connect(`mongodb+srv://${dbUser}:${dbPassword}@cluster0.lxutp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`).then(() => {
    app.listen(port)
    console.log("Conectou ao banco")
}).catch((err) => console.log(err))



