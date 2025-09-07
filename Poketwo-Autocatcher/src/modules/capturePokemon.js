import Discord from "discord.js-selfbot-v13";
import { updateStats } from "./stats.js";
import config from "../../config.json" with { type: "json" };
import pokeHint from 'pokehint';
const { checkRarity } = pokeHint;

let captureCount = 0;

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
        if (logChannel) {
            await logChannel.send(
                `[${message.guild.name}/#${message.channel.name}] **__${pokeName}__** • Rarity: **${rarity}**`
            );
        }
    } catch (error) {
        console.error("Log Capture Error:", error);
        const errorChannel = client.channels.cache.get(config.errorChannelID);
        if (errorChannel) errorChannel.send(`Error logging capture: ${error.message}`);
    }
}

export const capturePokemon = async (client, message, pokeName) => {

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