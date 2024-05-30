
const crypto = require('crypto')

const generateVerificationCode = () => {
    //Gerando um código hexadecimal:
    return crypto.randomBytes(3).toString('hex')
}

//Códigos enviados:
const verificationCodes = {}

//Armazenando os códigos + a data de envio deles:
const storeVerificationCode = (email, code) => {
    verificationCodes[email] = {code, timestamp: Date.now()}
}

//Verificando o código inserido:
const verifyCode = (email, code) => {
    //Gravando o código:
    const record = verificationCodes[email]
    
    if (!record) return false

    //Verificando se o código expirou:
    const isExpired = (Date.now() - record.timestamp) > (10 * 60 * 1000)
    if (isExpired) {
        delete verificationCodes[email]
        return false
    }

    const isValid = record.code === code
    if (isValid) delete verificationCodes[email]
    
    return isValid
}

module.exports = {generateVerificationCode, storeVerificationCode, verifyCode}
