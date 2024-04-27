require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const app = express()

//Config JSON response
app.use(express.json())

//Models
const Farmacia = require('./models/Farmacia')

//Rota pública
app.get('/', (req, res) => {
    res.status(200).json({msg: "Bem vindo a nossa API!"})
})

//Rota privada
app.get('/farma/:id', checkToken, async (req, res) => {

    const id = req.params.id 

    //verifica se a farmácia existe
    const farma = await Farmacia.findById(id, '-senha')

    if (!farma){
        return res.status(404).json({msg: "Farmácia não encontrada"})
    }

    res.status(200).json({ farma })

})

function checkToken(req, res, next){

    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(" ")[1]

    if(!token){
        return res.status(401).json({msg: "Acesso negado!"})
    }

    try {

        const secret = process.env.SECRET 

        jwt.verify(token, secret)

        next()
        
    } catch (error) {
        res.status(400).json({msg: "Token inválido!"})
    }

}

// Registrar Farmácias
app.post('/auth/register', async(req, res) =>{

    const {cnpj, nome, email, senha, confirmasenha, cep} = req.body

    //validações
    if (!nome){
        return res.status(422).json({msg: 'O nome é obrigatório'})
    }

    if (!cnpj){
        return res.status(422).json({msg: 'O CNPJ é obrigatório'})
    }

    if (!email){
        return res.status(422).json({msg: 'O email é obrigatório'})
    }

    if (!senha){
        return res.status(422).json({msg: 'A senha é obrigatória'})
    }

    if (senha != confirmasenha){
        return res.status(422).json({msg: 'As senhas não conferem!'})
    }

    //verifca se a farmárcia existe
    const farmaExists = await Farmacia.findOne({ cnpj: cnpj})

    if (farmaExists){
        return res.status(422).json({msg: 'O CNPJ informado já foi cadastrado!'})
    }

    //criando a senha
    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(senha, salt)

    // registrando a farmácia
    const farmacia = new Farmacia({
        cnpj,
        nome,
        email,
        senha: passwordHash,
        cep,
    })

    try {
       
        await farmacia.save()

        res.status(201).json({msg: 'Usuário criado com sucesso!'})
        
    } catch (error) {

        console.log(error)
        res.status(500).json({msg:'Algo deu errado. Tenta novamente mais tarde!'})
    }

})


//Login da Farmacia
app.post('/auth/login', async (req, res) => {

    const {cnpj, senha} = req.body

    //validações
    if (!cnpj){
        return res.status(422).json({msg: 'O CNPJ é obrigatório'})
    }

    if (!senha){
        return res.status(422).json({msg: 'A senha é obrigatória'})
    }

    //checar se a farmácia existe
    const farma = await Farmacia.findOne({ cnpj: cnpj})

    if (!farma){
        return res.status(404).json({msg: 'O CNPJ informado não foi encontrado!'})
    }

    //checar se a senha é correspondente
    const checkPassword = await bcrypt.compare(senha, farma.senha)

    if (!checkPassword){
        return res.status(422).json({msg: 'Senha inválida!'})
    }


    try {
        
        const secret = process.env.SECRET 

        const token = jwt.sign({
            id: farma._id,
        },
        secret,
    )

    res.status(200).json({msg: "Autentificação realizada com sucesso!", token})

    } catch (error) {
        console.log(error)
        res.status(500).json({msg:'Algo deu errado. Tenta novamente mais tarde!'})
    }


})


//Credencials
const dbUser = process.env.DB_USER
const dbPassword = process.env.DB_PASS

mongoose.connect(`mongodb+srv://${dbUser}:${dbPassword}@guilherme.zmse9y1.mongodb.net/?retryWrites=true&w=majority&appName=Guilherme`).then(() => {
    app.listen(3000)
    console.log("Conectou ao banco")
}).catch((err) => console.log(err))



