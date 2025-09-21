import { handleBotCommand } from "./botcommand.js";
import { handlePoketwoMessage } from "./poketwo.js";
import { handlePokeNameMessage } from "./pokename.js";
import { getBotConfig, updateBotConfig } from "../utils/config.js";

export const handleIncomingMessage = async (client, message) => {

    const botConfig = getBotConfig(client.user.id)
    // Handler Bot Commands
    if (
        botConfig &&
        message.content.startsWith(botConfig.prefix) &&
        message.author.id === botConfig.OwnerID
    ) {
        handleBotCommand(client, message);
        return;
    }

    if(
        botConfig &&
        message.content === "$bots hi" &&
        message.author.id === botConfig.OwnerID
    ) {
        message.channel.send(`Hi <@${botConfig.OwnerID}>! Type \`${botConfig.prefix} help\` for help menu`)
        return;
    }

    // Handle Captcha Detection
    if (
        message.content.includes("Please tell us") &&
        message.author.id === "716390085896962058"
    ) {
        const allowedChannels = Array.isArray(botConfig.catchChannelIds) ? botConfig.catchChannelIds : [];
        // If catch channels are set and this channel not included, ignore
        if (allowedChannels.length > 0 && !allowedChannels.includes(message.channel.id)) return;

        // Captcha Detected Stop Spamming
        message.channel.send(
            `⚠️ Captcha Detected! Resolve captch manually and then run \`${botConfig.prefix} spam start\` to resume spamming and \`${botConfig.prefix} catch start\` to resume capturing.`
        );

        await updateBotConfig(botConfig.botId, {
            isSpamming: false,
            isCapturing: false,
        })

        return;
    }

    // handler Poketwo Messages
    if (message.author.id === "716390085896962058") {
        await handlePoketwoMessage(client, message);
        return;
    }

    // Handle Pokemname Guess
    if (message.author.id == "874910942490677270") {
        await handlePokeNameMessage(client, message);
        return;
    }
}