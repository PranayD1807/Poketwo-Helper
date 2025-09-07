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

export const getRandomInterval = (min, max)  =>{
    return Math.floor(Math.random() * (max - min + 1)) + min;
}