export const findOutput = (input) => {
    if (json.hasOwnProperty(input)) {
        return json[input];
    } else {
        return input;
    }
}

export const checkSpawnsRemaining = (string) => {
    const match = string.match(/Spawns Remaining: (\d+)/);
    if (match) {
        const spawnsRemaining = parseInt(match[1]);
        console.log(spawnsRemaining);
    }
}

export const getRandomInterval = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const extractPokemonName = (text) => {
    // Matches '##' + emojis (optional), then captures as many characters (including spaces)
    // as possible until it encounters the start of an emoji (<:), bracket 【, or end of string
    const match = text.match(/##\s+(?:<:.+?:\d+>\s+)*([\p{L}\s\-']+?)(?=\s*<:|【|$)/u);
    return match ? match[1].trim() : null;
}

export const extractChannelId = (str) => {
    const match = str.match(/<#(\d+)>/);
    return match ? match[1] : null;
}
