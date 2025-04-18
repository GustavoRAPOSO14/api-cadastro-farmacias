const router = require('express').Router()
const Farmacia = require('../models/Farmacia')
const Produtos = require('../models/Produtos')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


//Rota privada
router.get('/:id', checkToken, async (req, res) => {

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
router.post('/auth/register', async(req, res) =>{

    const {cnpj, nome, rede, email, senha, confirmasenha, rua, bairro, numero, cep, uf, cidade} = req.body

    //validações
    if (!nome){
        return res.status(422).json({msg: 'O nome é obrigatório'})
    }

    if (!cnpj){
        return res.status(422).json({msg: 'O CNPJ é obrigatório'})
    }

    if (!rede){
        return res.status(422).json({msg: 'A rede é obrigatória'})
    }

    if (!rua){
        return res.status(422).json({msg: 'A rua é obrigatória'})
    }

    if (!bairro){
        return res.status(422).json({msg: 'O bairro é obrigatório'})
    }

    if (!numero){
        return res.status(422).json({msg: 'O número é obrigatório'})
    }

    if (!uf){
        return res.status(422).json({msg: 'A uf é obrigatória'})
    }

    if (!cidade){
        return res.status(422).json({msg: 'A cidade é obrigatória'})
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

    //verifca se o email já foi cadastrado
    const emailExists = await Farmacia.findOne({ email: email})

    if (emailExists){
        return res.status(422).json({msg: 'O email informado já foi cadastrado!'})
    }

    //criando a senha
    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(senha, salt)

    // registrando a farmácia
    const farmacia = new Farmacia({
        cnpj,
        nome,
        rede,
        email,
        senha: passwordHash,
        rua,
        bairro,
        numero,
        cep,
        uf,
        cidade
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
router.post('/auth/login', async (req, res) => {

    const {cnpj, email, senha} = req.body

    //validações
    if (!cnpj){
        return res.status(422).json({msg: 'O CNPJ é obrigatório'})
    }

    if (!email){
        return res.status(422).json({msg: 'O email é obrigatório'})
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

        const farma_id = farma._id
        
        const secret = process.env.SECRET 

        const token = jwt.sign({
            id: farma._id,
        },
        secret,
    )

    res.status(200).json({msg: "Autentificação realizada com sucesso!", token, farma_id})

    } catch (error) {
        console.log(error)
        res.status(500).json({msg:'Algo deu errado. Tenta novamente mais tarde!'})
    }


})

//Atualiza dados da Farmácia
router.patch('/:id', async (req, res) => {

    const id = req.params.id
    const {cnpj, nome, rede, email, senha, rua, bairro, numero, cep, uf, cidade} = req.body

    // verifica se o cnpj já foi cadastrado
    const farmaExists = await Farmacia.findOne({ cnpj: cnpj})

    if (farmaExists){
        return res.status(422).json({msg: 'O CNPJ informado já foi cadastrado!'})
    }

    try {
        const farmaciaUpdated = await Farmacia.findByIdAndUpdate(id, {cnpj, nome, rede, email, rua, bairro, numero, cep, uf, cidade})

        if (!farmaciaUpdated){
            return res.status(404).json({msg: "Farmácia não encontrada"})
        }

        res.status(200).json({msg: "Atualizado com sucesso"})
        
    } catch (error) {
        res.status(500).json({msg: error})
    }

})


//Deleta os dados da farmácia 
router.delete('/:id', async (req, res) => {
    const id = req.params.id;

    // Verifica se a farmácia existe
    const farma = await Farmacia.findById(id, '-senha');

    if (!farma) {
        return res.status(404).json({ msg: "Farmácia não encontrada" });
    }

    try {
        // Deleta os produtos associados à farmácia
        await Produtos.deleteMany({ farmacia: id });

        // Deleta a farmácia
        await Farmacia.findByIdAndDelete(id);

        res.status(200).json({ msg: "Farmácia excluída com sucesso!" });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Algo deu errado. Tenta novamente mais tarde!" });
    }
});





module.exports = router