const fs = require('fs');
const path = require('path');

module.exports = {
    data: {
        name: 'private',
        description: 'Envia uma imagem armazenada localmente'
    },
    async execute(sock, message, args) {
        try {
            // Lê o arquivo da imagem (caminho relativo ou absoluto)
            
            const img = path.join(__dirname, './src/main/sakaki.webp')
            const text = "> Private:\n\n/You"

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
