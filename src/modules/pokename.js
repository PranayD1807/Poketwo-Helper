import { extractPokemonName } from "../utils/common.js";
import { capturePokemon } from "./capturePokemon.js";
import { getBotConfig, updateBotConfig } from "../utils/config.js";

export const toggleIncenseMode = async (message) => {
    const botConfig = getBotConfig(message.client.user.id);
    if (!botConfig) return;

    const newMode = !botConfig.incenseMode; // toggle or default to false if undefined
    await updateBotConfig(botConfig.botId, { incenseMode: newMode });

    await message.channel.send(`🌸 Incense Mode is now ${newMode ? "enabled" : "disabled"}.`);
    console.log(`⏰ ${new Date().toLocaleTimeString()} | 🌸 Incense Mode is now ${newMode ? "enabled" : "disabled"}.`);
};

export const handlePokeNameMessage = async (client, message) => {
    try {
        const botConfig = getBotConfig(client.user.id);
        if (!botConfig) return;

        const allowedChannels = Array.isArray(botConfig.catchChannelIds) ? botConfig.catchChannelIds : [];

        // If catch channels are set and this channel not included, ignore
        if (allowedChannels.length > 0 && !allowedChannels.includes(message.channel.id)) return;

        if (message.embeds?.length > 0 && message.embeds[0].image) {
            await message.channel.send(
                "⚠️ Pokename textnaming is disabled! Please type `-toggle textnaming` to enable it."
            );
            return;
        }

        if (!message.content) return;

        const pokeName = extractPokemonName(message.content);
        if (!pokeName) return;

        // Use incenseMode from bot config, default false
        const incenseMode = !!botConfig.incenseMode;
        let delay;

        if (incenseMode) {
            // 2 to 5 seconds
            delay = (Math.floor(Math.random() * 4) + 2) * 1000;
        } else {
            // 5 to 10 seconds
            delay = (Math.floor(Math.random() * 6) + 5) * 1000;
        }

        console.log(`⏰ ${new Date().toLocaleTimeString()} | 🐸 A Pokemon Spawned, Try Catching in ${delay / 1000} seconds`);

        setTimeout(async () => {
            await capturePokemon(client, message, pokeName);
        }, delay);
    } catch (error) {
        console.error("HandlePokeNameMessage error:", error);
        const botConfig = getBotConfig(client.user.id);
        const errorChannelID = botConfig?.errorChannelID;
        const errorChannel = errorChannelID ? client.channels.cache.get(errorChannelID) : null;
        if (errorChannel) await errorChannel.send(`Error in handlePokeNameMessage: ${error.message}`);
    }
};
