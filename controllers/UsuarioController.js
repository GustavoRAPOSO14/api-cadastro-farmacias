const router = require('express').Router()
const Usuario = require('../models/Usuario')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


//Rota privada
router.get('/:id', checkToken, async (req, res) => {

    const id = req.params.id 

    //verifica se o usuário existe
    const user = await Usuario.findById(id, '-senha')

    if (!user){
        return res.status(404).json({msg: "Usuário não encontrado"})
    }

    res.status(200).json({ user })

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

// Registrar Usuário
router.post('/auth/register', async(req, res) =>{

    const {cpf, nome, email, telefone, senha, confirmasenha, cep} = req.body

    //validações
    if (!nome){
        return res.status(422).json({msg: 'O nome é obrigatório'})
    }

    if (!cpf){
        return res.status(422).json({msg: 'O CPF é obrigatório'})
    }

    if (!email){
        return res.status(422).json({msg: 'O email é obrigatório'})
    }

    if (!telefone){
        return res.status(422).json({msg: 'O telefone é obrigatório'})
    }

    if (!cep){
        return res.status(422).json({msg: 'O CEP é obrigatório'})
    }

    if (!senha){
        return res.status(422).json({msg: 'A senha é obrigatória'})
    }

    if (senha != confirmasenha){
        return res.status(422).json({msg: 'As senhas não conferem!'})
    }

    //verifica se o usuário existe
    const usuarioExists = await Usuario.findOne({ cpf: cpf})

    if (usuarioExists){
        return res.status(422).json({msg: 'Um usuário já foi cadastrado com esse número de CPF!'})
    }

    //criando a senha
    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(senha, salt)

    // registrando o usuário
    const usuario = new Usuario({
        cpf,
        nome,
        email,
        telefone,
        senha: passwordHash,
        cep,
    })

    try {
       
        await usuario.save()

        res.status(201).json({msg: 'Usuário criado com sucesso!'})
        
    } catch (error) {

        console.log(error)
        res.status(500).json({msg:'Algo deu errado. Tenta novamente mais tarde!'})
    }

})


//Login do Usuario
router.post('/auth/login', async (req, res) => {

    const {email, senha} = req.body

    //validações
    if (!email){
        return res.status(422).json({msg: 'O email é obrigatório'})
    }

    if (!senha){
        return res.status(422).json({msg: 'A senha é obrigatória'})
    }

    //checar se o usuário existe
    const user = await Usuario.findOne({ email: email})

    if (!user){
        return res.status(404).json({msg: 'O usuário informado não foi encontrado!'})
    }

    //checar se a senha é correspondente
    const checkPassword = await bcrypt.compare(senha, user.senha)

    if (!checkPassword){
        return res.status(422).json({msg: 'Senha inválida!'})
    }


    try {
        
        const secret = process.env.SECRET 

        const token = jwt.sign({
            id: user._id,
        },
        secret,
    )

    res.status(200).json({msg: "Autentificação realizada com sucesso!", token})

    } catch (error) {
        console.log(error)
        res.status(500).json({msg:'Algo deu errado. Tenta novamente mais tarde!'})
    }

})

//Atualiza dados do usuário
router.patch('/:id', async (req, res) => {

    const id = req.params.id
    const {cpf, nome, email, telefone, senha, cep} = req.body

    // verifica se o email já foi cadastrado
    const userExists = await Usuario.findOne({ email: email})

    if (userExists){
        return res.status(422).json({msg: 'O usuário informado já foi cadastrado!'})
    }

    try {
        const usuarioUpdated = await Usuario.findByIdAndUpdate(id, {cpf, nome, email, telefone, senha, cep})

        if (!usuarioUpdated){
            return res.status(404).json({msg: "Usuário não encontrado"})
        }

        res.status(200).json({msg: "Atualizado com sucesso"})
        
    } catch (error) {
        res.status(500).json({msg: error})
    }

})


//Deleta os dados do usuário
router.delete('/:id', async (req, res) => {

    const id = req.params.id

    //verifica se o usuário existe
    const user = await Usuario.findById(id, '-senha')

    if (!user){
        return res.status(404).json({msg: "Usuário não encontrado"})
    }

    try {

        await Usuario.findByIdAndDelete(id)
        res.status(200).json({msg: "Usuário excluído com sucesso!"})
        
    } catch (error) {
        res.status(500).json({msg: "Algo deu errado. Tenta novamente mais tarde!"})
    }

})



module.exports = router