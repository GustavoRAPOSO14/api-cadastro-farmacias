# Use uma imagem base do Node.js
FROM node:18-alpine

# Configure o diretório de trabalho no contêiner
WORKDIR /app

# Copie o package.json e o package-lock.json
COPY package*.json ./

# Instale as dependências
RUN npm install

# Copie todo o código do backend para o contêiner
COPY . .

# Exponha a porta usada pelo backend
EXPOSE 5000

# Comando para rodar o backend
CMD ["npm", "start"]
