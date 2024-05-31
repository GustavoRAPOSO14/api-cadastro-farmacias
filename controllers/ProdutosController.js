const router = require('express').Router()
const Produtos = require('../models/Produtos')


//Acessando todos os produtos:
router.get("/", async (req, res) => {

    try {
        const produtos = await Produtos.find()

        res.status(200).json(produtos)
        
    } catch (error) {
        res.status(500).json({error: error})
    }

})


//Acessar produto por ID
router.get("/:id", async (req, res) => {

    const id = req.params.id

    //verifica se o produto existe
    const produto = await Produtos.findById(id)

    if (!produto) {
        return res.status(404).json({msg: 'Produto inexistente'})
    }

    res.status(200).json({produto})

})


//Registrar o produto:
router.post("/auth/register", async(req, res) => {

    const{EAN, nome, preco, quantidade, dosagem} = req.body

    //Validações:
    if (!EAN){
        return res.status(422).json({msg: "O código EAN do produto é obrigatório!"})
    }

    if (!nome){
        return res.status(422).json({msg: "O nome do produto é obrigatório!"})
    }

    if (!preco){
        return res.status(422).json({msg: "O preço do produto é obrigatório!"})
    }

    if (!quantidade){
        return res.status(422).json({msg: "A quantidade do produto é obrigatória!"})
    }

    if (!dosagem){
        return res.status(422).json({msg: "A dosagem de produto é obrigatória!"})
    }

    const produto = new Produtos({
        EAN,
        nome,
        preco,
        quantidade,
        dosagem
    })

    try {
        await produto.save()

        res.status(201).json({msg: "Produto cadastrado com sucesso!"})
    } catch (error) {
        console.log(error)
        res.status(500).json({msg:"Algo deu errado. Tente novamente mais tarde!"})
    }
})


//Atualiza dados da Farmácia
router.patch('/:id', async (req, res) => {

    const id = req.params.id
    const {EAN, nome, preco, quantidade, dosagem} = req.body

    try {
        const produtoUpdated = await Produtos.findByIdAndUpdate(id, {EAN, nome, preco, quantidade, dosagem})

        if (!produtoUpdated){
            return res.status(404).json({msg: "Produto não encontrado"})
        }

        res.status(200).json({msg: "Atualizado com sucesso"})
        
    } catch (error) {
        res.status(500).json({msg: error})
    }

})

//Deleta produtos
router.delete('/:id', async (req, res) => {

    const id = req.params.id

    //verifica se o produto existe
    const product = await Produtos.findById(id)

    if (!product){
        return res.status(404).json({msg: "Produto inexistente!"})
    }

    try {
        
        await Produtos.findByIdAndDelete(id)
        res.status(200).json({msg: "Produto excluído com sucesso!"})
        
    } catch (error) {
        res.status(500).json({msg: "Algo deu errado. Tenta novamente mais tarde!"})
    }

})


module.exports = router