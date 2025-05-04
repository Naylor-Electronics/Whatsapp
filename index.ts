import makeWASocket, { Browsers } from 'baileys'
import fs from 'fs'
import path from 'path'
import QRCode from 'qrcode'
import P from 'pino'


async function main() {
    // DO NOT USE IN PROD!!!!
    const { state, saveCreds } = await useMultiFileAuthState("lib/auth_info_baileys");
    const naylor = makeWASocket(
        {
            browser: Browsers.macOS("Desktop"), // can be Windows/Ubuntu instead of macOS
            auth: state, // auth state of your choosing,
            logger: P(), // you can configure this as much as you want, even including streaming the logs to a ReadableStream for upload or saving to a file
        }
    );


    naylor.ev.on('messages.upsert', ({ type, messages }) => {

        if (type == "notify") { // new messages
            for (const M of messages) {
                const pushName = M.pushName; 

               
                // messages is an array, do not just handle the first message, you will miss messages
            }
        }


    })


    // this will be called as soon as the credentials are updated
    naylor.ev.on("creds.update", saveCreds);

} main();

async function loadCommand() {
    const foldersPath = path.join(__dirname, 'commands');
    const commandFolders = fs.readdirSync(foldersPath);

    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            // Set a new item in the Collection with the key as the command name and the value as the exported module
            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }
    }
}