const { BlobServiceClient } = require('@azure/storage-blob');
const fs = require('fs');
const path = require('path');

const containerName = 'produtos';

async function uploadToAzure(filePath, fileName, mimeType) {
  try {
    // Conexão
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING
    );

    // Container
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Caso queira garantir que o container existe
    await containerClient.createIfNotExists({
      access: 'blob', // garante acesso público a blobs individuais
    });

    // Nome único do arquivo para evitar colisão
    const blobName = `${Date.now()}-${fileName}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Upload do arquivo local
    await blockBlobClient.uploadFile(filePath, {
      blobHTTPHeaders: { blobContentType: mimeType },
    });

    // URL pública do blob
    const fileUrl = blockBlobClient.url;
    return fileUrl;
  } catch (error) {
    console.error('Erro no upload para Azure Blob:', error);
    throw error;
  }
}

module.exports = uploadToAzure;
