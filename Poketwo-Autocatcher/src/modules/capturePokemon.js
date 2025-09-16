import Discord from "discord.js-selfbot-v13";
import { updateStats } from "./stats.js";
import config from "../../config.json" with { type: "json" };
import pokeHint from 'pokehint';
const { checkRarity } = pokeHint;

let captureCount = 0;
let isCapturing = true;

async function logCapture(client, message, collected, pokeName) {
    try {
        captureCount++;
        updateStats(0, 1);
        console.log(`🕒 ${new Date().toLocaleTimeString()} | 🐸 Pokemons: ${captureCount}`);

        let rarity;
        try {
            rarity = await checkRarity(pokeName);
        } catch {
            rarity = "Not Found in Database";
        }
        const logChannel = client.channels.cache.get(config.logChannelID);
        if (logChannel && pokeName) {
            const addTag = config.tags.some(tag => pokeName.toLowerCase().includes(tag.toLowerCase())) || config.tags.some(tag => (rarity && rarity.toLowerCase().includes(tag.toLowerCase())));
            await logChannel.send(
                `${addTag ? `🎉 Congratulations <@${config.OwnerID}>! ` : ""}` +
                `A **${rarity}** Pokémon, **${pokeName}**, was captured in **${message.guild.name}** (#${message.channel.name})!`
            );

        }
    } catch (error) {
        console.error("Log Capture Error:", error);
        const errorChannel = client.channels.cache.get(config.errorChannelID);
        if (errorChannel) errorChannel.send(`Error logging capture: ${error.message}`);
    }
}

export const capturePokemon = async (client, message, pokeName) => {

    if (!isCapturing) return;

    try {
        await message.channel.send(`<@716390085896962058> c ${pokeName}`);

        const filter = (msg) => msg.author.id === "716390085896962058";
        const collector = new Discord.MessageCollector(message.channel, filter, {
            max: 1,
            time: 13000,
        });

        collector.on("collect", async (collected) => {
            if (collected.content.includes("Congratulations")) {
                await logCapture(client, message, collected, pokeName);
                collector.stop();
            }
        });

        collector.on("end", (collected, reason) => {
            if (reason !== "user") {
                console.log("Collector ended without catching message.");
            }
        });
    } catch (error) {
        console.error("Send catch command error:", error);
        const errorChannel = client.channels.cache.get(config.errorChannelID);
        if (errorChannel) await errorChannel.send(`Error sending catch command: ${error.message}`);
    }
}

export const enableAutoCatcher = async (message) => {
    if (!isCapturing) {
        isCapturing = true;
        await message.channel.send("🟢 Starting Auto Capture!");
        console.log("🟢 Starting Auto Capture!");
    } else {
        await message.channel.send("⚠️ Auto Capture is already enabled.");
        console.log("⚠️ Auto Capture is already enabled.");
    }
}

export const disableAutoCatcher = async (message) => {
    if (isCapturing) {
        isCapturing = false;
        await message.channel.send("🔴 Stopping Auto Capture!");
        console.log("🔴 Stopping Auto Capture!");
    } else {
        await message.channel.send("⚠️ Auto Capture is already enabled.");
        console.log("⚠️ Auto Capture is already enabled.");
    }
}

export const getCaptureStatus = () => {
    return isCapturing;
}