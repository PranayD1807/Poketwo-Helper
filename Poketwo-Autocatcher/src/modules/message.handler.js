import { stopSpamming } from "./spam.js";
import { handleBotCommand } from "./botcommand.js";
import { handlePoketwoMessage } from "./poketwo.js";
import { handlePokeNameMessage } from "./pokename.js";
import { getBotConfig } from "../utils/config.js";

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
        // Captcha Detected Stop Spamming
        message.channel.send(
            "⚠️ Captcha Detected! Resolve captch manually and then run `$autobot spam start` to resume spamming."
        );

        stopSpamming(client);
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