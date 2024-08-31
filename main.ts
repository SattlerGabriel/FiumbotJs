import {Client, Embed, EmbedBuilder, Events, GatewayIntentBits, ActivityOptions} from 'discord.js';
import {isAdmin, ProcessCommand} from "./utils/bot-utils";
import {Play, Queue, Skip} from "./utils/video-manager";
import {FifaAddSong, FifaRemoveSong, FifaSeeList, LoadFifaToQueue} from "./utils/fifa";

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
    client.user!.setPresence({
        activities: [{name: `-> ${prefix}?`, type: 3}],
    })
});

client.login(token);

client.on(Events.MessageCreate, async message => {
    const msg = message.content;

    if (msg.toLowerCase()[0] !== prefix || msg === '' || msg.length < 2 || message.author.bot) return;

    const command = ProcessCommand(msg);
    console.log(command);

    switch (command.Command.toLowerCase()) {
        case '?':
            message.channel.send({embeds: [await Help()]});
            break;
        case 'p':
            if (!message.member!.voice?.channel) return message.channel.send('> Tenes que estar en un vc');
            await Play(message, command.Args, agent);
            break;
        case 's':
            if (!message.member!.voice?.channel) return message.channel.send('> Tenes que estar en un vc');
            await Skip(message, agent);
            break;
        case 'q':
            await Queue(message);
            break;
        case 'fifadd':
            FifaAddSong(message, command.Args);
            break;
        case 'fifaq':
            await FifaSeeList(message);
            break;
        case 'fifar':
            await FifaRemoveSong(message, command.Args);
            break;
        case 'fifa':
            await LoadFifaToQueue(message, agent);
            break;
        case 'test':
            if (!isAdmin(message)) return message.channel.send('> THIS IS A CERTIFIED FIUMBO COMMAND');
            await Play(message, 'https://www.youtube.com/watch?v=OyCFSNHjGQI', agent);
            await Play(message, 'https://www.youtube.com/watch?v=OyCFSNHjGQI', agent);
            await Play(message, 'https://www.youtube.com/watch?v=OyCFSNHjGQI', agent);
            break;
    }
})

async function Help() {
    return new EmbedBuilder()
        .setColor("#00ffff")
        .setTitle('Lista de Comandos')
        .addFields({
            name: '?',
            value: 'Muestra este menu',
        }, {
            name: 'p <query>',
            value: 'Busca la query en youtube y lo agrega a la queue',
        }, {
            name: 's',
            value: 'Salta el video actual',
        }, {
            name: 'q',
            value: 'Muestra la cola de canciones',
        }, {
            name: 'fifa',
            value: '⚽🥅🎶🎶🎶🎶',
        }, {
            name: 'fifadd <titulo completo del video>',
            value: 'Agrega una canción al json de fifa',
        }, {
            name: 'fifar <indice de la cancion>',
            value: 'Saca una cancion del json',
        }, {
            name: 'fifaq',
            value: 'Muestra la lista de canciones de fifa',
        });
}