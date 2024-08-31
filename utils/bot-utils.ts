import {Message} from "discord.js";

function ProcessCommand(message: string): Command {
    const content = message.split(' ');
    // Si el comando es un shorthand trimeamos solo el prefix
    if (content[0].length > 1)
        return new Command(content[0].slice(1).toString(), content[1]);
    else
        return new Command(content[1], content[2]);
}

function isAdmin(message: Message): boolean {
    return message.member!.user.id === '225241876410793985';
}

class Command {
    public Command: string;
    public Args: string;

    public constructor(command: string, args: string) {
        this.Command = command;
        this.Args = args;
    }
}

export {ProcessCommand, isAdmin};