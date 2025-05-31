const fs = require('fs');
const path = require('path');

module.exports = {
    data: {
        name: 'menu',
        description: 'Envia uma imagem armazenada localmente'
    },
    async execute(sock, message, args) {
        try {
            // Lê o arquivo da imagem (caminho relativo ou absoluto)
            
            const img = path.join(__dirname, './src/main/elianeRadigue.jpg')
            const text = "> Bem vindo(a) ao Naylor-Services\n\n/Classic\n/Services\nShope\n/Desktop\nApp"

            await sock.sendMessage(
                message.key.remoteJid,
                { 
                    image: { 
                        url: img
                    },
                    caption: text 
                }
            );
        } catch (error) {
            console.error("Erro ao enviar imagem:", error);
            await sock.sendMessage(
                message.key.remoteJid,
                { text: "❌ Ocorreu um erro ao enviar a imagem." }
            );
        }
    }
};