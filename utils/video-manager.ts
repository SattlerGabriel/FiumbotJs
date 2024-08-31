import {EmbedBuilder, Message} from "discord.js";
import {
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
    NoSubscriberBehavior,
    VoiceConnection
} from "@discordjs/voice";
import {YouTubeVideo} from "play-dl";

require('dotenv').config();

const {google} = require("googleapis");
const youtube = google.youtube({version: "v3", auth: process.env.GOOGLE_API});
const ytdl = require('@distube/ytdl-core');
const play = require('play-dl');
const player = createAudioPlayer({
    behaviors: {noSubscriber: NoSubscriberBehavior.Play}
})

class Video {
    public id: string;
    public title: string;
    public url: string;
    public duration: number;
    public processedDuration: string;

    public constructor(id: string, title: string, url: string, duration: number, processedDuration: string) {
        this.id = id;
        this.title = title;
        this.url = url;
        this.duration = duration;
        this.processedDuration = processedDuration;
    }
}

var connection: VoiceConnection;
const queue: Video[] = [];
var playingTimeout: any;
var isPlaying = false;

async function Queue(message: Message) {
    if (queue.length == 0) return message.channel.send("> La lista de canciones esta vacia");

    const fields = queue.map((video: Video) => {
        return {name: video.title, value: video.processedDuration, inline: false};
    })
    const queueEmbed = new EmbedBuilder()
        .setColor("#ffaa00")
        .setTitle('Listado de canciones')
        .addFields(fields);

    message.channel.send({embeds: [queueEmbed]});
}

async function Play(message: Message, query: string, agent: any) {
    if (!message.member?.voice?.channel) return message.channel.send('Tenes que estar en un VC')

    try {
        if (query.includes('/playlist'))
            return message.channel.send('Formato de playlist equivocado')
        else if (query.includes('&list='))
            await GetPlaylist(message, query.split("&list=")[1]);
        else
            await GetFirstVideoResult(message, query);

        await PlayVideo(message, agent);
    } catch (e) {
        console.log(e);
        message.channel.send('Hubo un error al procesar la cancion/playlist');
    }
}

async function PlayVideo(message: Message, agent: any) {
    if (queue.length === 0 || isPlaying) return;

    connection = joinVoiceChannel({
        channelId: message.member!.voice.channel!.id,
        guildId: message.guild!.id,
        adapterCreator: message.guild!.voiceAdapterCreator
    })

    console.log(queue[0].url)
    const stream = ytdl(queue[0].url, {
        audioonly: true,
        highWaterMark: 1 << 25,
        quality: 'highestaudio',
        agent: agent
    });
    const resource = createAudioResource(stream,
        {
            inputType: stream.type
        })

    player.play(resource);
    connection.subscribe(player);
    console.log(queue[0]);

    isPlaying = true;
    message.channel.send(`Reproduciendo ${queue[0].title}`);

    playingTimeout = setTimeout(() => {
        if (queue.length > 0) {
            console.log("penis");
            queue.shift();
            isPlaying = false;
            PlayVideo(message, agent);
        }
    }, queue[0].duration);
}

async function Skip(message: Message, agent: any) {
    if (queue.length == 0) return message.channel.send("> La lista de canciones esta vacia");
    message.channel.send(`Saltando la canción ➡ **${queue[0].title}**`);
    queue.shift();
    player.stop();

    clearTimeout(playingTimeout);
    isPlaying = false;
    await PlayVideo(message, agent);
}

async function GetPlaylist(message: Message, query: string) {
    await play.playlist_info(query, {incomplete: true}).then((playlist: any) => {
        playlist.videos.map((video: any) => {
            AddToQueue(message, video);
        })
    })
}

async function GetFirstVideoResult(message: Message, query: string) {
    const response = await play.search(query, {limit: 1}).then((videos: YouTubeVideo[]) => {
        AddToQueue(message, videos[0]);
    });
}

async function AddToQueue(message: Message, video: YouTubeVideo) {
    try {
        queue.push(new Video(video.id!, video.title!, video.url!, video.durationInSec! * 1000, video.durationRaw!));
        message.channel.send(`> Agregada el video ➡ **${video.title}**`);
    } catch (e) {
        console.log(e);
        return;
    }
}

export {Play, Queue, Skip};