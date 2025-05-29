const router = require('express').Router()
const Usuario = require('../models/Usuario')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy

const { OAuth2Client } = require('google-auth-library');
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);


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

    const {nome, email, senha, confirmasenha} = req.body

    //validações
    if (!nome){
        return res.status(422).json({msg: 'O nome é obrigatório'})
    }

    // if (!cpf){
    //     return res.status(422).json({msg: 'O CPF é obrigatório'})
    // }

    if (!email){
        return res.status(422).json({msg: 'O email é obrigatório'})
    }

    // if (!telefone){
    //     return res.status(422).json({msg: 'O telefone é obrigatório'})
    // }

    // if (!cep){
    //     return res.status(422).json({msg: 'O CEP é obrigatório'})
    // }

    if (!senha){
        return res.status(422).json({msg: 'A senha é obrigatória'})
    }

    if (senha != confirmasenha){
        return res.status(422).json({msg: 'As senhas não conferem!'})
    }

    // //verifica se o usuário existe
    // const usuarioExists = await Usuario.findOne({ cpf: cpf})

    // if (usuarioExists){
    //     return res.status(422).json({msg: 'Um usuário já foi cadastrado com esse número de CPF!'})
    // }

    //Verifica se o email já foi usado
    const emailExists = await Usuario.findOne({ email: email})

    if (emailExists){
        return res.status(422).json({msg: 'Um usuário já foi cadastrado com esse email!'})
    }

    //criando a senha
    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(senha, salt)

    // registrando o usuário
    const usuario = new Usuario({
        nome,
        email,
        senha: passwordHash,
        googleId: null
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
    const {nome, email, senha} = req.body

    // verifica se o email já foi cadastrado
    const userExists = await Usuario.findOne({ email: email})

    if (userExists){
        return res.status(422).json({msg: 'O usuário informado já foi cadastrado!'})
    }

    try {
        const usuarioUpdated = await Usuario.findByIdAndUpdate(id, {nome, email, senha})

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

// Rota para login social com Google
router.post('/auth/google', async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ msg: "Token de autenticação não fornecido." });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture, id } = payload;

    let user = await Usuario.findOne({ email });

    //criando a senha
    const senha = 'ertegvttrdhbtyb' + id
    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(senha, salt)

    if (!user) {
      // Cria novo usuário
      user = new Usuario({
        nome: name,
        email,
        senha: passwordHash,
        googleId,
      });
      await user.save();
    }

    const secret = process.env.SECRET 

        const token = jwt.sign({
            id: user._id,
        },
        secret,
    )

    res.status(200).json({
      msg: 'Login com Google bem-sucedido',
      token,
      user: {
        id: user._id,
        nome: user.nome,
        email: user.email,
      },
    });
  } catch (err) {
    console.error('Erro ao verificar o token Google:', err);
    res.status(401).json({ msg: 'Token Google inválido' });
  }
});




// passport.use(new GoogleStrategy({
//     clientID: process.env.GOOGLE_CLIENT_ID,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     callbackURL: 'https://api-cadastro-farmacias.onrender.com/usuarios/auth/google/callback'
// }, async (acessToken, refreshToken, profile, done) => {
//     try {

//         //verifica se o usuário existe
//         const user = await Usuario.findOne({email: profile.emails[0].value})

//         if (user) {
//             return done(null, user)
//         }

//         //criando a senha
//         const senha = 'ertegvttrdhbtyb' + profile.id
//         const salt = await bcrypt.genSalt(12)
//         const passwordHash = await bcrypt.hash(senha, salt)

//         const newUser = new Usuario({
//             nome: profile.displayName,
//             email: profile.emails[0].value,
//             senha: passwordHash,
//             googleId: profile.id
//         })

//         await newUser.save()


//         return done(null, newUser)


        
//     } catch (error) {
//         done(error)
//     }
// }
// ))




// passport.serializeUser((user, done) => {
//     done(null, user._id)
// })

// passport.deserializeUser( async (userId, done) => {
//     try {
//         //verifica se o usuário existe
//         const user = await Usuario.findById(userId, '-senha')

//         if (!user){
//             return done( new Error("Usuário não encontrado"))
//         }

//         done(null, user)
    
//     } catch (error) {
//         done(error)
//     }
// })


// router.get('/auth/google', passport.authenticate('google', {scope: ["profile", "email"]}))



// router.get('/auth/google/callback', passport.authenticate('google', {failureRedirect: "/auth/login"}), (req, res) => {
    
//     return res.redirect('/usuarios/auth/session')
// })


// router.get('/auth/session', (req, res) => {

//     if (req.isAuthenticated()){

//         const userId = req.user._id
//         const user = req.user
//         const secret = process.env.SECRET 

//         const token = jwt.sign({
//             id: user._id,
//         },
//         secret,)

//         return res.status(200).json({msg: "Autentificação realizada com sucesso!", token, userId})

//     }
//     res.status(401).json({msg: 'Usuário não autentificado'})
// })


module.exports = router