import {Client, Embed, EmbedBuilder, Events, GatewayIntentBits} from 'discord.js';
import {isAdmin, ProcessCommand} from "./utils/bot-utils";
import {Play, Queue, Skip} from "./utils/video-manager";

require('dotenv').config();
const ytdl = require('@distube/ytdl-core');
const fs = require("fs");
const agent = ytdl.createAgent(JSON.parse(fs.readFileSync("secret.json")));

const token = process.env.BOT_TOKEN;
const prefix = process.env.BOT_PREFIX;

const intents = [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildEmojisAndStickers, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageTyping, GatewayIntentBits.GuildVoiceStates];

const client = new Client({intents: intents});

client.once(Events.ClientReady, readyClient => {
    console.log(`Logged in as ${readyClient.user.tag}!`);
});

client.login(token);

client.on(Events.MessageCreate, async message => {
    const msg = message.content;

    if (msg.toLowerCase()[0] !== prefix || msg === '' || msg.length < 2 || message.author.bot) return;

    const command = ProcessCommand(msg);
    console.log(command);

    switch (command.Command.toLowerCase()) {
        case '?':
        case 'h':
        case 'help':
            message.channel.send({embeds: [await Help()]});
            break;
        case 'p':
        case 'play':
            if (!message.member!.voice?.channel) return message.channel.send('> Tenes que estar en un vc');
            await Play(message, command.Args, agent);
            break;
        case 's':
        case 'skip':
            if (!message.member!.voice?.channel) return message.channel.send('> Tenes que estar en un vc');
            await Skip(message, agent);
            break;
        case 'q':
        case 'queue':
            await Queue(message);
            break;
        case 'test':
            if (!isAdmin(message)) return message.channel.send('> THIS IS A CERTIFIED FIUMBO COMMAND');
            await Play(message, 'https://www.youtube.com/watch?v=OyCFSNHjGQI', agent);
            await Play(message, 'https://www.youtube.com/watch?v=OyCFSNHjGQI', agent);
            await Play(message, 'https://www.youtube.com/watch?v=OyCFSNHjGQI', agent);
            break;
        default:
            message.channel.send('Command not found');
            break;
    }
})

async function Help() {
    return new EmbedBuilder()
        .setColor("#00ffff")
        .setTitle('Lista de Comandos')
        .addFields({
            name: 'h / help',
            value: 'Muestra este menu',
            inline: true
        });
}