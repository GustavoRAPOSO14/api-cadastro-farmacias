const express = require('express')
const {sendMail} = require('./controllers/mail.js')
const {verifyCode} = require('./services/verificationService')

const router = express.Router()

//Rota que envia o e-mail:
router.post('/send-code', sendMail)

//Rota de verificação do código:
router.post('/verify-code', (req, res) => {
    const {email, code} = req.body

    if (verifyCode(email, code)) {
        return res.json('Código bate com o que foi enviado.')
    } else {
        return res.status(400).json("Código inválido ou expirado.")
    }

})

module.exports = router
