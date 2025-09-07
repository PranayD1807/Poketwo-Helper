import config from "../../config.json" with { type: "json" };
import { updateStats } from "./stats.js";
import { getRandomInterval } from "../utils/common.js";

const messages = [
    "🚨 beep beep Pikachu crossing the road",
    "🔍 finding a Bulbasaur in tall grass",
    "😱 oh no Team Rocket stole my snacks",
    "🐉 Charizard just burned my homework",
    "📡 scanning for Jigglypuff karaoke nearby",
    "🥷 sneaky Meowth is plotting something",
    "⚡ Pikachu overcharged my phone battery",
    "🛑 Officer Jenny just gave me a ticket",
    "🍕 Snorlax ate my midnight pizza order",
    "🚀 Team Rocket blasting off in my backyard",
    "🎣 Magikarp flopping on the sidewalk",
    "🔥 Charmander heating up my coffee",
    "🥽 Squirtle squad invading the swimming pool",
    "🌙 Umbreon haunting the dark alley",
    "🎤 Jigglypuff singing everyone to sleep",
    "🚗 beep beep Psyduck driving a taxi",
    "🏃 Machop chasing me down the street",
    "📦 Ditto disguised as my Amazon package",
    "☁️ Lugia flapping strong winds today",
    "🍎 Chikorita stealing apples from my bag",
    "🚧 Geodude blocking the walking path",
    "🎮 Pikachu hacked my Nintendo Switch",
    "📞 Porygon answering spam calls for me",
    "🥵 Charmander made my AC stop working",
    "🚨 beep beep Detective Pikachu arriving",
    "🦴 Cubone crying in the corner",
    "🍦 Vanillite melting in the sun",
    "🌊 Gyarados flooding my backyard",
    "🚴 Ash late to bike practice again",
    "🍌 Mankey threw bananas at me",
    "🦆 Psyduck doesn't understand anything",
    "💤 Snorlax blocking the railway crossing",
    "👕 Eevee stole my hoodie again",
    "🏖️ Lapras offering free beach rides",
    "📸 Pikachu photobombing selfies",
    "🤖 Magnemite charging my headphones",
    "🥕 Buneary stealing my carrots",
    "🚦 Pokéball stuck at a red light",
    "🎁 Meowth gifting empty boxes",
    "⛑️ Nurse Joy treating my fainted hopes",
    "🌋 Moltres lighting fireworks tonight",
    "🥊 Hitmonlee kicking traffic cones",
    "🍩 Jigglypuff stole my last donut",
    "🍿 Pikachu binge-watching anime",
    "🦎 Charmander sunbathing by the pool",
    "🛶 Totodile rowing upstream too fast",
    "🔔 Beedrill ringing morning alarms",
    "🎇 Pikachu overloading the city grid",
    "🕵 Detective Pikachu solving cookie thefts",
    "📜 Abra rewinding my homework notes",
    "🧢 Ash lost his hat again",
    "🚓 Officer Jenny tailing Meowth",
    "🐢 Turtwig hiding in the garden",
    "🍹 Slowpoke mixing tropical shakes",
    "🎳 Geodude smashed the bowling pins",
    "🛎️ Jigglypuff singing hotel lullabies",
    "📌 Ditto pretending to be my pillow",
    "⚔️ Lucario sparring in the backyard",
    "🚕 Pikachu calling a ride share",
    "🦉 Noctowl staring through my window",
    "💡 Pikachu powered the whole house",
    "🍀 Shaymin hiding in flower pots",
    "🍒 Cherubi dangling on my window frame",
    "🚁 Pidgeot delivering air mail",
    "☕ Espurr serving weird coffee vibes",
    "🪙 Meowth flipping coins all day",
    "🎢 Gengar riding the rollercoaster",
    "🎭 Ditto failed cosplay attempt",
    "🚰 Squirtle broke the water pipes",
    "🥶 Articuno freezing traffic lights",
    "🛼 Pikachu roller-skating in the mall",
    "🥞 Snorlax crushing pancake stack",
    "🏰 Dragonite delivering royal mail",
    "🥽 Psyduck lifeguarding the beach",
    "🩺 Nurse Joy reviving my phone battery",
    "🍫 Munchlax ate all the candy bars",
    "🦑 Inkay spilling ink on homework",
    "🎱 Pokéball mistaken for pool ball",
    "🛎️ Jigglypuff pressing random doorbells",
    "🚦 Pikachu controlling traffic signals",
    "🛋️ Snorlax stealing seats on the bus",
    "🌪️ Tornadus giving bad hair days",
    "🧊 Regice hiding in my freezer",
    "🎯 Ash missing Pokéball throws again",
    "🍵 Bulbasaur brewing herbal tea",
    "🍋 Pikachu shocked my lemonade",
    "🏀 Geodude dunked the basketball",
    "🧹 Rotom cleaning my Roomba",
    "😴 Slowking daydreaming in meetings",
    "🤹 Mime Jr juggling Pokéballs",
    "🧃 Charmander boiled my juice box",
    "📀 Porygon glitching in VHS tapes",
    "🍉 Tropius growing fruit snacks",
    "🪄 Alakazam bending spoons again",
    "🐝 Beedrill swarming the playground",
    "🛋️ Wobbuffet crashed my couch",
    "🎂 Pikachu blew my birthday candles",
    "🚄 Electrode racing on subway rails",
    "🕰️ Celebi messing with my schedule",
];

let messagesCount = 0;
let timeoutID = null;

const spam = (channel) => {
    try {
        const randomMessage =
            messages[Math.floor(Math.random() * messages.length)];
        channel.send(randomMessage);
        messagesCount++;
        console.log(
            `🕒 ${new Date().toLocaleTimeString()} | 💬 Messages: ${messagesCount}`
        );
        updateStats(1, 0); // Update stats with 1 message sent
        const randomInterval = getRandomInterval(1500, 5000); // Random interval for spam between 1 second and 5 seconds
        timeoutID = setTimeout(() => spam(channel), randomInterval);
    } catch (error) {
        console.error("💥 Error in spam function:", error);
    }
};

export const startSpamming = (client, commandSentFromChannel) => {
    if(!config.spamChannelID){
        console.log("⚠️ Please set the spamChannelID in config.json to enable spamming.");
        return;
    }
    if(timeoutID){
        commandSentFromChannel.channel.send("⚠️ Spam is already running. ⚠️");
        console.log("⚠️ Spam is already running. ⚠️");
        return;
    }
    const channel = client.channels.cache.get(config.spamChannelID);
    commandSentFromChannel.channel.send("🟢 Starting spam! 🟢");
    console.log("🟢 Starting spam! 🟢");
    spam(channel);
};

export const stopSpamming = (client, commandSentFromChannel) => {
    if (timeoutID) {
        commandSentFromChannel.channel.send("🔴 Stopping spam! 🔴");
        console.log("🔴 Stopping spam! 🔴");
        clearTimeout(timeoutID);
        timeoutID = null;
    } else {
        commandSentFromChannel.channel.send("⚠️ Spam is not running. ⚠️");
        console.log("⚠️ Spam is not running. ⚠️");
    }
};
