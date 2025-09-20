import { updateStats } from "./stats.js";
import pokeHint from 'pokehint';
import { getBotConfig, updateBotConfig } from "../utils/config.js";
import { getDiscordUserInfo } from "./user.js";
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

export const logSuccessfulCapture = async (client, message) => {
    const botConfig = getBotConfig(client.user.id);
    if (!botConfig) return;
    try {
        captureCount++;
        updateStats(0, 1);
        const botInfo = getDiscordUserInfo(client.user.id);
        
        console.log(`🕒 ${new Date().toLocaleTimeString()} | 🐸 Pokemons: ${captureCount} | Captured by: ${botInfo.displayName}`);

        const captureChannelID = botConfig.captureChannelID;
        const captureChannel = captureChannelID ? client.channels.cache.get(captureChannelID) : null;
        if (!captureChannel) return;

        const content = message.content;

        const regex = /Level (\d+) ([\w\s]+)(<:\w+:\d+>)? \(([\d.]+)%\)/i;
        const match = content.match(regex);
        if (!match) return;

        const level = match[1];
        const pokeName = match[2].trim();
        const emojiTag = match[3] || "";
        const iv = match[4];

        const gender = (() => {
            if (!emojiTag) return "unknown";
            if (emojiTag.includes(":male:")) return "Male";
            if (emojiTag.includes(":female:")) return "Female";
            if (emojiTag.includes(":unknown:")) return "Unknown";
            return "unknown";
        })();

        const isShiny = content.includes("These colors seem unusual...");
        const shinyText = isShiny ? "✨ Shiny " : "";

        let rarity = "Unknown";
        try {
            rarity = await checkRarity(pokeName);
        } catch (error) {
            console.log(`⏰ ${new Date().toLocaleTimeString()} | Error checking rarity for ${pokeName}:`, error);
        }

        // Normalize tags to lowercase for case-insensitive comparison
        const tagsLower = (Array.isArray(botConfig.tags) ? botConfig.tags : []).map(t => t.toLowerCase());

        const addTag =
            tagsLower.some(tag => pokeName.toLowerCase().includes(tag)) ||
            (rarity && tagsLower.some(tag => rarity.toLowerCase().includes(tag))) ||
            (isShiny && tagsLower.includes("shiny"));

        const ownerId = botConfig.OwnerID ?? "";

        const logMessage =
            `${addTag ? `🎉 Congratulations <@${ownerId}>!\n` : ""}` +
            `🎯 **Pokemon Caught**!\n` +
            `- 🏷️ Name: ${shinyText}${pokeName}\n` +
            `- 🔥 Rarity: ${rarity}\n` +
            `${isShiny ? `- ✨ Shiny: It's a shiny!\n` : ""}` +
            `- 🎚️ Level: ${level}\n` +
            `- ⚧ Gender: ${gender}\n` +
            `- 📊 IV: ${iv}%\n` +
            `- 🌐 Server: ${message.guild?.name ?? "Unknown"}\n` +
            `- 💬 Channel: ${message.channel ? `<#${message.channel.id}>` : "Unknown"}`;

        await captureChannel.send(logMessage);
    } catch (e) {
        console.error("Log Capture Error:", e);
        const errorChannelID = botConfig.errorChannelID;
        const errorChannel = errorChannelID ? client.channels.cache.get(errorChannelID) : null;
        if (errorChannel) errorChannel.send(`Error logging capture: ${error.message}`);
    }
};

export const capturePokemon = async (client, message, pokeName) => {
    const botConfig = getBotConfig(client.user.id);
    if (!botConfig) return;
    if (!getIsCapturing(botConfig)) return;

    try {
        await message.channel.send(`<@716390085896962058> c ${pokeName}`);
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
        console.log(`⏰ ${new Date().toLocaleTimeString()} | 🟢 Starting Auto Capture!`);
    } else {
        await message.channel.send("⚠️ Auto Capture is already enabled.");
        console.log(`⏰ ${new Date().toLocaleTimeString()} | ⚠️ Auto Capture is already enabled.`);
    }
};

export const disableAutoCatcher = async (message) => {
    const botConfig = getBotConfig(message.client.user.id);
    if (!botConfig) return;

    if (getIsCapturing(botConfig)) {
        await setIsCapturing(botConfig.botId, false);
        await message.channel.send("🔴 Stopping Auto Capture!");
        console.log(`⏰ ${new Date().toLocaleTimeString()} | 🔴 Stopping Auto Capture!`);
    } else {
        await message.channel.send("⚠️ Auto Capture is already disabled.");
        console.log(`⏰ ${new Date().toLocaleTimeString()} | ⚠️ Auto Capture is already disabled.`);
    }
};

export const getCaptureStatus = (botId) => {
    const botConfig = getBotConfig(botId);
    if (!botConfig) return false;
    return getIsCapturing(botConfig);
};
