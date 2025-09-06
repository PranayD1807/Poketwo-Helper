/*
@Developer: 🔥⃤•AK_ØPᵈᵉᵛ✓#6326 / akshatop
Name: Poketwo-Autocatcher
Version: V1.3.2
Description: bot to help users with catching pokemons
@Supported: poketwo/pokemon
STAR THIS REPO(https://github.com/AkshatOP/Poketwo-Autocatcher) FOR IT TO WORK
*/
const Discord = require("discord.js-selfbot-v13");
const client = new Discord.Client({
    checkUpdate: false,
});
const express = require("express");
const { solveHint, checkRarity } = require("pokehint");
const { ocrSpace } = require("ocr-space-api-wrapper");
const fs = require("fs");
const path = require("path");
const config = require("./config.json");
const json = require("./namefix.json");
const allowedChannels = []; // Add your allowed channel IDs to this array or leave it like [] if you want to it to catch from all channels
let isSleeping = false;
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

//------------------------- KEEP-ALIVE--------------------------------//

const app = express();
if (Number(process.version.slice(1).split(".")[0]) < 8)
    throw new Error(
        "Node 8.0.0 or higher is required. Update Node on your system."
    );
app.get("/", (req, res) => {
    res.status(200).send({
        success: "true",
    });
});
app.listen(process.env.PORT || 3000);

//--------------------------------------------------------------//

//-------------------------SOME EXTRA FUNCTIONS----------------------------//

function findOutput(input) {
    if (json.hasOwnProperty(input)) {
        return json[input];
    } else {
        return input;
    }
}

function checkSpawnsRemaining(string) {
    const match = string.match(/Spawns Remaining: (\d+)/);
    if (match) {
        const spawnsRemaining = parseInt(match[1]);
        console.log(spawnsRemaining);
    }
}

function updateStats(messages = 0, captures = 0) {
    const filePath = path.join(__dirname, "stats.json");
    let stats = { messages: 0, captures: 0 };

    if (fs.existsSync(filePath)) {
        stats = JSON.parse(fs.readFileSync(filePath, "utf8"));
    }

    stats.messages += messages;
    stats.captures += captures;

    fs.writeFileSync(filePath, JSON.stringify(stats, null, 2));
    return stats;
}

//--------------------------------------------------------------------------//

//-------------------------READY HANDLER+SPAMMER-----------------------//

let messagesCount = 0;
let captureCount = 0;

client.on("ready", () => {
    console.log("https://github.com/AkshatOP/Poketwo-Autocatcher");
    console.log(`Acount: ${client.user.username} is ONLINE, `);
    console.log(
        "Note: When your using Incense then make sure it occurs in a separate channel where hint bots like pokename/sierra aren't enabled to send message there!"
    );
    console.log("Use $help to know about commands");

    const channel = client.channels.cache.get(config.spamChannelID);

    function getRandomInterval(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function spam() {
        const randomMessage =
            messages[Math.floor(Math.random() * messages.length)];
        channel.send(randomMessage);
        messagesCount++;
        console.log(
            `🕒 ${new Date().toLocaleTimeString()} | 💬 Messages: ${messagesCount}`
        );
        updateStats(1, 0); // Update stats with 1 message sent
        const randomInterval = getRandomInterval(1500, 5000); // Random interval for spam between 1 second and 5 seconds
        setTimeout(spam, randomInterval);
    }
    spam();
});

//------------------------------------------------------------//

//-------------------------Anti-Crash-------------------------//

process.on("unhandledRejection", (reason, p) => {
    if (reason == "Error: Unable to identify that pokemon.") {
    } else {
        console.log(" [antiCrash] :: Unhandled Rejection/Catch");
        console.log(reason, p);
    }
});
process.on("uncaughtException", (err, origin) => {
    console.log(" [antiCrash] :: Uncaught Exception/Catch");
    console.log(err, origin);
});
process.on("uncaughtExceptionMonitor", (err, origin) => {
    console.log(" [antiCrash] :: Uncaught Exception/Catch (MONITOR)");
    console.log(err, origin);
});
process.on("multipleResolves", (type, promise, reason) => {
    console.log(" [antiCrash] :: Multiple Resolves");
    console.log(type, promise, reason);
});

//------------------------------------------------------------//

//----------------------------AUTOCATCHER--------------------------------------//

client.on("messageCreate", async (message) => {
    if (
        message.content === "$captcha_completed" &&
        message.author.id === config.OwnerID
    ) {
        isSleeping = false;
        message.channel.send("Autocatcher Started!");
    }

    if (message.content === "$help" && message.author.id === config.OwnerID) {
        await message.channel.send(
            "``` Poketwo-Autocatcher\n Link: https://github.com/AkshatOP/Poketwo-Autocatcher\n\n $captcha_completed : Use to restart the bot once captcha is solved\n $say <content> : Make the bot say whatever you want\n $react <messageID> : React with ✅ emoji\n $click <messageID> : Clicks the button which has ✅ emoji\n $help : To show this message ```"
        );
    }

    if (!isSleeping) {
        if (
            message.content.includes("Please tell us") &&
            message.author.id === "716390085896962058"
        ) {
            isSleeping = true;
            message.channel.send(
                "Autocatcher Stopped , Captcha Detected! Use `$captcha_completed` once the captcha is solved "
            );
            setTimeout(async function () {
                isSleeping = false;
            }, 18000000); //5 hours
        } else if (
            message.content.startsWith("$say") &&
            message.author.id == config.OwnerID
        ) {
            let say = message.content.split(" ").slice(1).join(" ");
            message.channel.send(say);
        } else if (
            message.content.startsWith("$react") &&
            message.author.id == config.OwnerID
        ) {
            let msg;
            try {
                const args = message.content.slice(1).trim().split(/ +/g);
                msg = await message.channel.messages.fetch(args[1]);
            } catch (err) {
                message.reply(
                    `Please Specify the message ID as an arguement like "$react <messageID>"`
                );
            }
            if (msg) {
                try {
                    msg.react("✅");
                    message.react("✅");
                } catch (err) {
                    message.react("❌");
                    console.log(err);
                }
            }
        } else if (
            message.content.startsWith("$click") &&
            message.author.id == config.OwnerID
        ) {
            let msg;
            try {
                var args = message.content.slice(1).trim().split(/ +/g);
                msg = await message.channel.messages.fetch(args[1]);
            } catch (err) {
                message.reply(
                    `Please Specify the message ID as an arguement like "$click <messageID>".`
                );
            }

            if (msg) {
                try {
                    await msg.clickButton();
                    message.react("✅");
                } catch (err) {
                    message.react("❌");
                    console.log(err);
                }
            }
        } else if (
            message.content == "That is the wrong pokémon!" &&
            message.author.id == "716390085896962058"
        ) {
            message.channel.send(`<@716390085896962058> h`);
        } else if (message.author.id == "716390085896962058") {
            if (message?.embeds[0]?.footer?.text.includes("Spawns Remaining")) {
                await message.channel.send(`<@716390085896962058> h`);
                if (
                    message.embeds[0]?.footer?.text ==
                    "Incense: Active.\nSpawns Remaining: 0."
                ) {
                    message.channel.send(`<@716390085896962058> buy incense`);
                }
            } else if (message.content.includes("The pokémon is")) {
                let rarity;
                const pokemon = await solveHint(message);
                console.log(`Catching ${pokemon[0]}`);
                await message.channel.send(
                    `<@716390085896962058> c ${pokemon[0]}`
                );
                updateStats(0, 1); // Update stats with 1 capture

                console.log(
                    "[" +
                        message.guild.name +
                        "/#" +
                        message.channel.name +
                        "] " +
                        pokemon[0]
                );
                try {
                    rarity = await checkRarity(`${pokemon[0]}`);
                } catch {
                    rarity = "Not Found in Database";
                }

                const channel6 = client.channels.cache.get(config.logChannelID);
                channel6.send(
                    "[" +
                        message.guild.name +
                        "/#" +
                        message.channel.name +
                        "] " +
                        "**__" +
                        pokemon[0] +
                        "__** " +
                        "Rarity " +
                        rarity
                );
            }
        } else {
            const Pokebots = ["696161886734909481", "874910942490677270"]; //sierra ,pokename
            if (
                allowedChannels.length > 0 &&
                !allowedChannels.includes(message.channel.id)
            ) {
                return;
            }
            if (Pokebots.includes(message.author.id)) {
                let preferredURL = null;
                message.embeds.forEach((e) => {
                    if (e.image) {
                        const imageURL = e.image.url;
                        if (imageURL.includes("prediction.png")) {
                            preferredURL = imageURL;
                        } else if (
                            imageURL.includes("embed.png") &&
                            !preferredURL
                        ) {
                            preferredURL = imageURL;
                        }
                    }
                });

                if (preferredURL) {
                    let url = preferredURL;

                    async function main() {
                        try {
                            const res1 = await ocrSpace(url, {
                                apiKey: `${config.ocrSpaceApiKey}`,
                            });
                            const name1 =
                                res1.ParsedResults[0].ParsedText.split("\r")[0];
                            const name5 = name1.replace(/Q/g, "R");
                            const name = findOutput(name5);

                            const delay =
                                Math.floor(Math.random() * 6 + 5) * 1000; //interval from 5-10seconds
                            console.log(
                                "🐸 A Pokemon Spawned, Catching in " +
                                    delay / 1000 +
                                    " seconds"
                            );

                            setTimeout(async () => {
                                message.channel
                                    .send(`<@716390085896962058> c ${name}`)
                                    .then((a) => {
                                        captureCount++;
                                        updateStats(0, 1); // Update stats with 1 capture
                                        console.log(
                                            `🕒 ${new Date().toLocaleTimeString()} | 🐸 Pokemons: ${captureCount}`
                                        );
                                    })
                                    .catch((error) => {
                                        console.error(error);
                                        const channel =
                                            client.channels.cache.get(
                                                config.errorChannelID
                                            );
                                        channel.send(error);
                                    });
                                const filter = (msg) =>
                                    msg.author.id === "716390085896962058";
                                const collector = new Discord.MessageCollector(
                                    message.channel,
                                    filter,
                                    {
                                        max: 1,
                                        time: 13000,
                                    }
                                ); // Collect only one message in 10 seconds

                                collector.on("collect", async (collected) => {
                                    if (
                                        collected.content.includes(
                                            "Congratulations"
                                        )
                                    ) {
                                        function capitalizeFirstLetter(str) {
                                            return (
                                                str.charAt(0).toUpperCase() +
                                                str.slice(1).toLowerCase()
                                            );
                                        }

                                        let rareity;
                                        const name2 =
                                            capitalizeFirstLetter(name);
                                        try {
                                            rareity = await checkRarity(
                                                `${name2}`
                                            );
                                        } catch {
                                            rareity = "Not Found in Database";
                                        }
                                        const logchannel =
                                            client.channels.cache.get(
                                                config.logChannelID
                                            );
                                        logchannel
                                            .send(
                                                "[" +
                                                    collected.guild.name +
                                                    "/#" +
                                                    collected.channel.name +
                                                    "] " +
                                                    "**__" +
                                                    name2 +
                                                    "__** " +
                                                    "Rarity " +
                                                    rareity
                                            )
                                            .then((b) => {})
                                            .catch((error) => {
                                                console.error(error);
                                                const channel =
                                                    client.channels.cache.get(
                                                        config.errorChannelID
                                                    );
                                                channel.send(error);
                                            });
                                        collector.stop();
                                    }
                                });
                            }, delay);
                        } catch (error) {
                            console.error(error);
                            const channel = client.channels.cache.get(
                                config.errorChannelID
                            );
                            channel.send(error);
                        }
                    }
                    main();
                }
            }
        }
    }
});
client.login(config.TOKEN); //use process.env.TOKEN if you are using it in repl.it
