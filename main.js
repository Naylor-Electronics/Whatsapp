const { makeWASocket, DisconnectReason, useMultiFileAuthState, getContentType } = require('@whiskeysockets/baileys');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

// Sistema de Comandos
const commands = new Map();
const foldersPath = path.join(__dirname, 'Commands');

// Carregar comandos apenas se a pasta existir
if (fs.existsSync(foldersPath)) {
    const commandFolders = fs.readdirSync(foldersPath);
    
    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            
            if ('data' in command && 'execute' in command) {
                commands.set(command.data.name, command);
                console.log(`Comando carregado: ${command.data.name}`);
            } else {
                console.log(`[AVISO] O comando em ${filePath} está faltando "data" ou "execute"`);
            }
        }
    }
} else {
    console.log('[AVISO] Pasta de comandos não encontrada. Ignorando sistema de comandos.');
}

async function main() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    const sock = makeWASocket({ auth: state });

    // Handler de Conexão
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log('Escaneie o QR Code abaixo para autenticar:');
            
            QRCode.toString(qr, { type: 'terminal' }, (err, url) => {
                if (err) throw err;
                console.log(url);
            });
            
            QRCode.toFile('qr.png', qr, { scale: 5 }, (err) => {
                if (err) console.error('Erro ao gerar QR Code:', err);
            });
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Conexão fechada:', lastDisconnect.error);
            if (shouldReconnect) setTimeout(main, 5000); // Reconecta após 5 segundos
        } else if (connection === 'open') {
            console.log('Conexão estabelecida com sucesso!');
        }
    });

    // Handler de Mensagens
    sock.ev.on('messages.upsert', async ({ messages }) => {
        for (const m of messages) {
            if (!m.message) return;
            const messageType = getContentType(m) // get what type of message it is (text, image, video...)
            
            const sender = m.key.remoteJid;
            const text = m.message.conversation || m.message.extendedTextMessage?.text  || '';
            
            console.log(`Mensagem de ${sender}: ${text}`);
            
            // Verificar se é um comando
            if (text.startsWith('/')) {
                const args = text.slice(1).trim().split(/ +/);
                const commandName = args.shift().toLowerCase();
                
                if (commands.has(commandName)) {
                    try {
                        await commands.get(commandName).execute(sock, m, messageType, args);
                    } catch (error) {
                        console.error('Erro ao executar comando:', error);
                        await sock.sendMessage(sender, { text: '❌ Ocorreu um erro ao executar o comando' });
                    }
                }
            }
        }
    });

    // Salvar credenciais
    sock.ev.on('creds.update', saveCreds);
}

main().catch(err => console.error('Erro no main:', err));