import Discord from "discord.js-selfbot-v13";
import { updateStats } from "./stats.js";
import pokeHint from 'pokehint';
import { getBotConfig, updateBotConfig } from "../utils/config.js";
const { checkRarity } = pokeHint;

let captureCount = 0;

/**
 * Helper to read isCapturing from bot config (default true)
 */
const getIsCapturing = (botConfig) => {
    if (typeof botConfig.isCapturing === "boolean") {
        return botConfig.isCapturing;
    }
    return true; // default enabled
};

/**
 * Helper to set isCapturing in bot config persistently
 */
const setIsCapturing = async (botId, state) => {
    await updateBotConfig(botId, { isCapturing: state });
};

async function logCapture(client, message, collected, pokeName) {
    const botConfig = getBotConfig(client.user.id);
    if (!botConfig) return;

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

        const logChannelID = botConfig.logChannelID;
        const logChannel = logChannelID ? client.channels.cache.get(logChannelID) : null;
        if (logChannel && pokeName) {
            const tags = Array.isArray(botConfig.tags) ? botConfig.tags : [];
            const addTag =
                tags.some(tag => pokeName.toLowerCase().includes(tag.toLowerCase())) ||
                (rarity && tags.some(tag => rarity.toLowerCase().includes(tag.toLowerCase())));

            const ownerId = botConfig.OwnerID ?? "";

            await logChannel.send(
                `${addTag ? `🎉 Congratulations <@${ownerId}>! ` : ""}` +
                `A **${rarity}** Pokémon, **${pokeName}**, was captured in **${message.guild?.name ?? "Unknown Server"}** (#${message.channel?.name ?? "Unknown Channel"})!`
            );
        }
    } catch (error) {
        console.error("Log Capture Error:", error);
        const errorChannelID = botConfig.errorChannelID;
        const errorChannel = errorChannelID ? client.channels.cache.get(errorChannelID) : null;
        if (errorChannel) errorChannel.send(`Error logging capture: ${error.message}`);
    }
}

export const capturePokemon = async (client, message, pokeName) => {
    const botConfig = getBotConfig(client.user.id);
    if (!botConfig) return;
    if (!getIsCapturing(botConfig)) return;

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
        const errorChannelID = botConfig.errorChannelID;
        const errorChannel = errorChannelID ? client.channels.cache.get(errorChannelID) : null;
        if (errorChannel) await errorChannel.send(`Error sending catch command: ${error.message}`);
    }
};

export const enableAutoCatcher = async (message) => {
    const botConfig = getBotConfig(message.client.user.id);
    if (!botConfig) return;

    if (!getIsCapturing(botConfig)) {
        await setIsCapturing(botConfig.botId, true);
        await message.channel.send("🟢 Starting Auto Capture!");
        console.log("🟢 Starting Auto Capture!");
    } else {
        await message.channel.send("⚠️ Auto Capture is already enabled.");
        console.log("⚠️ Auto Capture is already enabled.");
    }
};

export const disableAutoCatcher = async (message) => {
    const botConfig = getBotConfig(message.client.user.id);
    if (!botConfig) return;

    if (getIsCapturing(botConfig)) {
        await setIsCapturing(botConfig.botId, false);
        await message.channel.send("🔴 Stopping Auto Capture!");
        console.log("🔴 Stopping Auto Capture!");
    } else {
        await message.channel.send("⚠️ Auto Capture is already disabled.");
        console.log("⚠️ Auto Capture is already disabled.");
    }
};

export const getCaptureStatus = (botId) => {
    const botConfig = getBotConfig(botId);
    if (!botConfig) return false;
    return getIsCapturing(botConfig);
};
