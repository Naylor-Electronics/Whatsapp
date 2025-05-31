const os = require('os');



module.exports = {
    data: {
        name: 'ping',
        description: 'Responde com Pong!'
    },
    async execute(sock, message, args) {
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        const uptime = os.uptime();
        
        const info = `📊 Informações do Sistema:
• Memória Total: ${(totalMem / 1024 / 1024 / 1024).toFixed(2)} GB
• Memória Usada: ${(usedMem / 1024 / 1024 / 1024).toFixed(2)} GB
• Uptime: ${(uptime / 60 / 60).toFixed(2)} horas
• CPU: ${os.cpus()[0].model}`;

        await sock.sendMessage(message.key.remoteJid, { text: info });


    }
};