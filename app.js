//Imports
require("dotenv").config()
const express = require("express")
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const cors = require("cors")

const app = express()

//Configurando a leitura de arquivos json:
app.use(express.json())

app.use(cors())

//Modelos (tabelas)
const User = require("./models/User")

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }))

//Rota de usuário deslogado
app.get("/", (req, res) => {
    res.status(200).json({ msg: "Bem-vindo a nossa API" })
})

//Rota de usuário logado
app.get("/user/:id", checkToken, async (req, res) => {
    const id = req.params.id

    //Checando se usuário existe no banco e, caso exista, não mostre sua senha.
    const user = await User.findById(id, "-senhaUser")

    if (!user) {
        return res.status(404).json({ msg: "Usuário não encontrado." })
    }
    //Caso o usuário exista, com base na url do perfil, mostre os dados de cadastro do perfil.
    res.status(200).json({ user })
})

function checkToken(req, res, next) {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]

    if (!token) {
        return res.status(401).json({ msg: "Acesso negado!" })
    }

    try {

        const secret = process.env.SECRET

        jwt.verify(token, secret)
        next()

    } catch (error) {
        res.status(400).json({ msg: "Token inválido!" })
    }
}

//Cadastro do usuário:
app.post("/auth/register", async (req, res) => {
    const { nomeUser, mailUser, cpf, senhaUser, cepUser, numeroUser, complementoUser, confirmSenhaUser } = req.body

    //Validação dos dados
    if (!nomeUser) {
        return res.status(422).json({ msg: "O nome é obrigatório!" })
    }
    if (!mailUser) {
        return res.status(422).json({ msg: "O telefone é obrigatório!" })
    }
    if (!cpf) {
        return res.status(422).json({ msg: "O cpf é obrigatório!" })
    }
    if (!senhaUser) {
        return res.status(422).json({ msg: "A senha é obrigatória!" })
    }
    if (!cepUser) {
        return res.status(422).json({ msg: "O CEP é obrigatório!" })
    }
    if (!numeroUser) {
        return res.status(422).json({ msg: "O numero da residência é obrigatório!" })
    }

    if (!confirmSenhaUser) {
        return res.status(422).json({ msg: "Faça a confirmação da senha." })
    }

    //Confirmação da senha.
    if (senhaUser != confirmSenhaUser) {
        return res.status(422).json({ msg: "As senhas não batem. Tente novamente." })
    }

    //Checando se o cpf já está cadastrado
    const userExists = await User.findOne({ mailUser: mailUser })

    if (userExists) {
        return res.status(422).json({ msg: "Este telefone já está cadastrado. tente novamente com um novo." })
    }

    //Encriptando senha
    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(senhaUser, salt)

    //Encriptando cpf
    const saltCPF = await bcrypt.genSalt(12)
    const cpfHash = await bcrypt.hash(cpf, salt)

    //Fazendo a inserção dos dados
    const user = new User({
        nomeUser,
        mailUser,
        cpf: cpfHash,
        senhaUser: passwordHash,
        cepUser,
        numeroUser,
        complementoUser
    })

    try {
        await user.save()
        res.status(201).json({ msg: "Usuário criado com sucesso!" })


    } catch (error) {
        console.log(error)
        res
            .status(500)
            .json({
                msg: "Erro da nossa parte! Tente novamente mais tarde..."
            })
    }
})

//Rota de Login
app.post("/auth/login", async (req, res) => {
    const { mailUser, senhaUser } = req.body

    //Validando dados
    if (!mailUser) {
        return res.status(422).json({ msg: "O e-mail é obrigatório!" })
    }
    if (!senhaUser) {
        return res.status(422).json({ msg: "A senha é obrigatória!" })
    }

    //Checando se o usuário existe
    const user = await User.findOne({ mailUser: mailUser })

    if (!user) {
        return res.status(404).json({ msg: "Usuário não encontrado." })
    }

    //Checando se a senha está correta para o login
    const checkPassword = await bcrypt.compare(senhaUser, user.senhaUser)

    if (!checkPassword) {
        return res.status(422).json({ msg: "A senha não está correta. Tente novamente!" })
    }


    //Login do usuário
    try {

        const secret = process.env.SECRET

        const token = jwt.sign({
            id: user._id,
        },
            secret,
        )

        res.status(200).json({ msg: "Usuário autenticado ", token })

    } catch (err) {
        console.log(err)

        res.status(500).json({
            msg: "Erro da nossa parte! Tente novamente mais tarde..."
        })
    }
})

//Puxando o nome de usuário e senha informados no .env:
const dbUser = process.env.DB_USER
const dbPass = process.env.DB_PASS

//Conexão com o banco
mongoose.connect(`mongodb+srv://${dbUser}:${dbPass}@guilherme.zmse9y1.mongodb.net/?retryWrites=true&w=majority&appName=Guilherme`).then(() => {
    app.listen(3003)
    console.log("Conectado ao MongoDB")
}).catch((err) => {
    console.log((err))
})