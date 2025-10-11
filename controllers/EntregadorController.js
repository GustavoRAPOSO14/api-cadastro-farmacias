const router = require('express').Router()
const Entregador = require('../models/Entregador')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


//Rota privada
router.get('/:id', checkToken, async (req, res) => {

    const id = req.params.id 

    //verifica se o entregador existe
    const entregador = await Entregador.findById(id, '-senha')

    if (!entregador){
        return res.status(404).json({msg: "Entregador não encontrado"})
    }

    res.status(200).json({ entregador })

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

// Registrar entregador
router.post('/auth/register', async(req, res) =>{

    const {cpf, email, nome, regiao, senha, confirmasenha} = req.body

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

    if (!regiao){
        return res.status(422).json({msg: 'A região de entrega é obrigatório'})
    }

    if (!senha){
        return res.status(422).json({msg: 'A senha é obrigatória'})
    }

    if (senha != confirmasenha){
        return res.status(422).json({msg: 'As senhas não conferem!'})
    }


    //Verifica se o email já foi usado
    const cpfExists = await Entregador.findOne({ cpf: cpf})

    if (cpfExists){
        return res.status(422).json({msg: 'Um entregador já foi cadastrado com esse cpf!'})
    }

    //criando a senha
    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(senha, salt)

    // registrando o entregador
    const entregador = new Entregador({
        cpf,
        email,
        nome,
        regiao,
        senha: passwordHash,
    })

    try {
       
        await entregador.save()

        res.status(201).json({msg: 'Entregador criado com sucesso!'})
        
    } catch (error) {

        console.log(error)
        res.status(500).json({msg:'Algo deu errado. Tenta novamente mais tarde!'})
    }

})


//Login do Entregador
router.post('/auth/login', async (req, res) => {

    const {cpf, senha} = req.body

    //validações
    if (!cpf){
        return res.status(422).json({msg: 'O cpf é obrigatório'})
    }

    if (!senha){
        return res.status(422).json({msg: 'A senha é obrigatória'})
    }

    //checar se o entregador existe
    const entregador = await Entregador.findOne({ cpf: cpf})

    if (!entregador){
        return res.status(404).json({msg: 'O entregador informado não foi encontrado!'})
    }

    //checar se a senha é correspondente
    const checkPassword = await bcrypt.compare(senha, entregador.senha)

    if (!checkPassword){
        return res.status(422).json({msg: 'Senha inválida!'})
    }


    try {
        
        const entregadorId = entregador._id

        const secret = process.env.SECRET 

        const token = jwt.sign({
            id: entregador._id,
        },
        secret,
    )

    res.status(200).json({msg: "Autentificação realizada com sucesso!", token, entregadorId})

    } catch (error) {
        console.log(error)
        res.status(500).json({msg:'Algo deu errado. Tenta novamente mais tarde!'})
    }

})

//Atualiza dados do entregador
router.patch('/:id', async (req, res) => {
  const id = req.params.id;
  const { cpf, nome, email, regiao, senha } = req.body;

  try {
    // Verifica se o email já está em uso por outro entregador
    if (email) {
      const entregadorExists = await Entregador.findOne({ email: email, _id: { $ne: id } });
      if (entregadorExists) {
        return res.status(422).json({ msg: 'O email informado já foi cadastrado!' });
      }
    }

    if (cpf) {
      const entregadorExists = await Entregador.findOne({ cpf: cpf, _id: { $ne: id } });
      if (entregadorExists) {
        return res.status(422).json({ msg: 'O cpf informado já foi cadastrado!' });
      }
    }

    const updateData = {};

    if (cpf) updateData.cpf = cpf;
    if (nome) updateData.nome = nome;
    if (email) updateData.email = email;
    if (regiao) updateData.regiao = regiao;

    if (senha) {
      // Criptografar a nova senha
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(senha, salt);
      updateData.senha = passwordHash;
    }

    const entregadorUpdated = await Entregador.findByIdAndUpdate(id, updateData, { new: true });

    if (!entregadorUpdated) {
      return res.status(404).json({ msg: 'Entregador não encontrado' });
    }

    res.status(200).json({ msg: 'Atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

//Deleta os dados do entregador
router.delete('/:id', async (req, res) => {

    const id = req.params.id

    //verifica se o entregador existe
    const entregador = await Entregador.findById(id, '-senha')

    if (!entregador){
        return res.status(404).json({msg: "Entregador não encontrado"})
    }

    try {

        await Entregador.findByIdAndDelete(id)
        res.status(200).json({msg: "Entregador excluído com sucesso!"})
        
    } catch (error) {
        res.status(500).json({msg: "Algo deu errado. Tenta novamente mais tarde!"})
    }

})


module.exports = router