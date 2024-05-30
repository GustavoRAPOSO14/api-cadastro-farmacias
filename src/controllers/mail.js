
const send = require("../services/nodemailer")
const {generateVerificationCode, storeVerificationCode} = require('../services/verificationService')

const sendMail = async(req, res) => {

    const {to} = req.body
    const code = generateVerificationCode()
    storeVerificationCode(to, code)

    //Título do e-mail
    const subject = 'Bem-vido(a) ao FarmaFacil!'
    //Corpo:
    const body = `
    <!DOCTYPE html>
    <html lang="pt-br">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Document</title>
      </head>
      <body>
        <style>
          .divMain {
            font-family: Arial, Helvetica, sans-serif;
            max-width: 600px;
            margin: auto;
            padding: 20px;
            border: 1px solid #ccc;
            border-radius: 10px;
          }
    
          .tittle {
            color: rgb(37, 184, 238);
          }
    
          .code {              
            text-align: center;        
            border-radius: 10px;
            border: 2px solid black;
          }
        </style>
    
        <div class="divMain">
          <h2 class="tittle">Bem-vindo(a) ao Farma-Fácil!</h2>
          <hr />
    
          <p>Seu código de verificação:</p>
    
          <div class="code">
            <h3>${code}</h3>            
          </div>
    
          <p class="info">
            Utilize este código para completar seu processo de
            verificação.
          </p>
    
          <p>Se você não solicitou este e-mail, por favor, ignore-o.</p>
    
          <p>Abraços, equipe FarmaFácil</p>
        </div>
      </body>
    </html>
    `
    //Verificando o código inserido:
    try {
        await send(to, subject, body)
        return res.json('Código de verificação enviado com sucesso!')
    } catch (error) {
        return res.status(500).json("Erro ao enviar e-mail.")
    }
}

module.exports = {
    sendMail
}
