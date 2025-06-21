// controllers/PedidoController.js
const express = require('express');
const router = express.Router();  // Use express.Router() para criar um novo Router

const Pedido = require('../models/Pedido');
const PedidoItem = require('../models/PedidoItem');

// Exemplo de rota GET
router.get('/', async (req, res) => {
    try {
        const pedidos = await Pedido.find().populate('usuario', 'nome').sort({'dataPedido': -1});
        if (pedidos.length === 0) {
            return res.status(404).json({ msg: 'Não há pedidos no momento' });
        }
        res.json(pedidos);
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Erro ao buscar pedidos' });
    }
});


// router.post('/', async (req, res) => {

//     try {
//         const itensPedidoIds = await Promise.all(req.body.itensPedido.map(async (itemPedido) => {
//             let novoItemPedido = new PedidoItem({
//                 quantidade: itemPedido.quantidade,
//                 product: itemPedido.product
//             });
    
//             novoItemPedido = await novoItemPedido.save();
//             return novoItemPedido._id;
//         }));
    
//         const itensPedidoIdsResolved = await itensPedidoIds
    
//         const totalPrices = await Promise.all(itensPedidoIdsResolved.map(async (itensPedidoId) => {
//             const itemPedido = await PedidoItem.findById(itensPedidoId).populate('product', 'preco')
//             const totalPrice = itemPedido.product.preco * itemPedido.quantidade
//             return totalPrice
//         }))
    
//         const precoTotal = totalPrices.reduce((a, b) => a + b, 0)
//     } catch (error) {
//         return res.status(422).json({msg: 'O pedido não pode estar vazio'})
//     }

//     const {endereco1, endereco2, city, cep, pais, telefone, status, usuario} = req.body


//     if (!endereco1){
//         return res.status(422).json({msg: 'O endereço é obrigatório'})
//     }

//     if (!city){
//         return res.status(422).json({msg: 'A cidade é obrigatória'})
//     }

//     if (!cep){
//         return res.status(422).json({msg: 'O cep é obrigatório'})
//     }

//     if (!pais){
//         return res.status(422).json({msg: 'O país é obrigatório'})
//     }

//     if (!telefone){
//         return res.status(422).json({msg: 'O telefone é obrigatório'})
//     }

//     const pedido = new Pedido({
//         itensPedido: itensPedidoIdsResolved,
//         endereco1: req.body.endereco1,
//         endereco2: req.body.endereco2,
//         city: req.body.city,
//         cep: req.body.cep,
//         pais: req.body.pais,
//         telefone: req.body.telefone,
//         status: req.body.status,
//         precoTotal: precoTotal,
//         usuario: req.body.usuario
//     });

//     try {
//         const savedPedido = await pedido.save();
//         res.status(201).json({ msg: 'Pedido criado com sucesso!'});
        
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ msg: 'Erro ao criar pedido' });
//     }


// })

// Exemplo de rota POST
router.post('/', async (req, res) => {
    try {
        
        const itensPedidoIds = await Promise.all(req.body.itensPedido.map(async (itemPedido) => {
            let novoItemPedido = new PedidoItem({
                quantidade: itemPedido.quantidade,
                product: itemPedido.product
            });

            novoItemPedido = await novoItemPedido.save();
            return novoItemPedido._id;
        }));

        const itensPedidoIdsResolved = await itensPedidoIds
    
        const totalPrices = await Promise.all(itensPedidoIdsResolved.map(async (itensPedidoId) => {
            const itemPedido = await PedidoItem.findById(itensPedidoId).populate('product', 'preco')
            const totalPrice = itemPedido.product.preco * itemPedido.quantidade
            return totalPrice
        }))
    
        const precoTotal = totalPrices.reduce((a, b) => a + b, 0)

        const {endereco1, endereco2, city, cep, pais, telefone, status, usuario, farmacia} = req.body

        if (!endereco1){
            return res.status(422).json({msg: 'O endereço é obrigatório'})
        }

        if (!city){
            return res.status(422).json({msg: 'A cidade é obrigatória'})
        }

        if (!cep){
            return res.status(422).json({msg: 'O cep é obrigatório'})
        }

        if (!pais){
            return res.status(422).json({msg: 'O país é obrigatório'})
        }

        if (!telefone){
            return res.status(422).json({msg: 'O telefone é obrigatório'})
        }

        const pedido = new Pedido({
            itensPedido: itensPedidoIdsResolved,
            endereco1: endereco1,
            endereco2: endereco2,
            city: city,
            cep: cep,
            pais: pais,
            telefone: telefone,
            status: status,
            precoTotal: precoTotal,
            usuario: usuario,
            farmacia: farmacia,
        });

        const savedPedido = await pedido.save();
        res.status(201).json({ msg: 'Pedido criado com sucesso!'});

    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Erro ao criar pedido' });
    }
});


router.get('/:id', async (req, res) => {
    
    const id = req.params.id
    const pedido = await Pedido.findById(id)
    .populate('usuario', 'nome')
    .populate('farmacia', 'nome')
    .populate({ path: 'itensPedido', populate: 'product'});

    
    if (!pedido) {
        return res.status(404).json({msg: 'Produto inexistente'})
    }

    res.status(200).json({pedido})

});


router.get('/farmacia/:farmaciaId', async (req, res) => {
    try {
      const farmaciaId = req.params.farmaciaId;
      
      // Buscar os produtos que pertencem à farmácia com o id fornecido
      const pedidos = await Pedido.find({ 'farmacia': farmaciaId });
  
      // Verificar se encontramos produtos
      if (pedidos.length === 0) {
        return res.status(404).json({ message: 'Nenhum pedido foi feito ainda' });
      }
  
      // Retornar os produtos encontrados
      res.json(pedidos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao buscar produtos' });
    }
  });


router.get('/usuarios/:usuarioId', async (req, res) => {
    try {
      const userId = req.params.usuarioId;
      
      // Buscar os pedidos que pertencem ao usuário com o id fornecido
      const pedidos = await Pedido.find({ 'usuario': userId });
  
      // Verificar se encontramos produtos
      if (pedidos.length === 0) {
        return res.status(404).json({ message: 'Nenhum pedido foi feito ainda' });
      }
  
      // Retornar os produtos encontrados
      res.json(pedidos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao buscar produtos' });
    }
  });



// atualiza o status do pedido
router.put('/:id', async (req, res) => {
    const pedido = await Pedido.findByIdAndUpdate(
        req.params.id,
        {
            status: req.body.status
        },
        { new: true}
    )

    if (!pedido){
        return res.status(404).json({msg: "Pedido não encontrado"})
    }

    res.status(200).json({msg: "Atualizado com sucesso"})
    //res.send(pedido)

})


//Deleta pedido
router.delete('/:id', async (req, res) => {

    Pedido.findByIdAndDelete(req.params.id).then(async pedido => {
        if (pedido){
            await pedido.itensPedido.map(async itemPedido => {
                await PedidoItem.findByIdAndDelete(itemPedido)
            })
            return res.status(200).json({msg: 'Pedido excluído'})
        } else {
            return res.status(404).json({msg: "Não foi possível excluir o pedido"})
        }
    }).catch(err=>{
        return res.status(500).json({msg: "Algo deu errado. Tenta novamente mais tarde!"})
    })


    // const id = req.params.id

    // //verifica se o produto existe
    // const pedido = await Pedido.findById(id)

    // if (!pedido){
    //     return res.status(404).json({msg: "Pedido inexistente!"})
    // }

    // try {
        
    //     await Pedido.findByIdAndDelete(id)
    //     res.status(200).json({msg: "Pedido excluído com sucesso!"})
        
    // } catch (error) {
    //     res.status(500).json({msg: "Algo deu errado. Tenta novamente mais tarde!"})
    // }

})



module.exports = router;  // Exportando o Router corretamente
