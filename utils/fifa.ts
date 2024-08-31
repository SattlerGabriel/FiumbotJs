import {EmbedBuilder, Message} from "discord.js";
import {Play} from "./video-manager";

const fs = require('fs');

function FifaAddSong(message: Message, song: string) {
    fs.readFile('fifa.json', (err: any, data: any) => {
        if (err) {
            console.log(err);
            message.channel.send(`> Error leyendo el listado de fifa`);
        }
        const fifaList = data != null ? JSON.parse(data) : [];
        fifaList.push(song);
        const stream = fs.createWriteStream('fifa.json', {flags: 'w+'});
        stream.write(JSON.stringify(fifaList));
        stream.end();
        message.channel.send(`> Agregada ${song} al listado de fifa`);
    });
}

function FifaRemoveSong(message: Message, indexString: string) {
    const index: number = parseInt(indexString);
    if (isNaN(index)) return message.channel.send('> Indice invalido');
    fs.readFile('fifa.json', (err: any, data: any) => {
        if (err) {
            console.log(err);
            message.channel.send(`> Error leyendo el listado de fifa`);
        }
        const fifaList: [] = data != null ? JSON.parse(data) : [];
        if (index > fifaList.length - 1) return message.channel.send('> Indice invalido');
        const removedSong: string = fifaList.splice(index, 1)[0];
        const stream = fs.createWriteStream('fifa.json', {flags: 'w+'});
        stream.write(JSON.stringify(fifaList));
        stream.end();
        message.channel.send(`> Removida ${removedSong} del listado`);
    });
}

function FifaSeeList(message: Message) {
    fs.readFile('fifa.json', async (err: any, data: any) => {
        if (err) {
            console.log(err);
            message.channel.send(`> Error leyendo el listado de fifa`);
        }
        const fifaList = data != null ? JSON.parse(data) : [];

        if (fifaList.length == 0) return await message.channel.send(`> El listado de fifa esta vacio`);

        let fields = [];
        for (let i = 0; i < 25; i++) {
            if (i >= fifaList.length) break;
            fields.push({name: `${i} - ${fifaList[i]}`, value: "   ", inline: false});
        }

        const listEmbed = new EmbedBuilder()
            .setColor("#aaffff")
            .setTitle('Listado de canciones')
            .addFields(fields);

        await message.channel.send({embeds: [listEmbed]});
    })
}

function LoadFifaToQueue(message: Message, agent: any) {
    fs.readFile('fifa.json', (err: any, data: any) => {
        if (err) {
            console.log(err);
            message.channel.send(`> Error leyendo el listado de fifa`);
        }
        const fifaList = data != null ? JSON.parse(data) : [];
        if (fifaList.length == 0) return message.channel.send(`> El listado de fifa esta vacio`);
        shuffleArray(fifaList);
        for (let i = 0; i < fifaList.length; i++) {
            Play(message, fifaList[i], agent);
        }
    })
}

function shuffleArray<T>(array: T[]): void {
    let currentIndex = array.length, randomIndex;
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
};

export {FifaAddSong, FifaRemoveSong, FifaSeeList, LoadFifaToQueue}