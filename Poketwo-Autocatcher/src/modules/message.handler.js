import config from "../../config.json" with { type: "json" };
import { stopSpamming } from "./spam.js";
import { handleBotCommand } from "./botcommand.js";
import { handlePoketwoMessage } from "./poketwo.js";
import { handlePokeNameMessage } from "./pokename.js";

export const handleIncomingMessage = async (client, message) => {

    // Handler Bot Commands
    if (
        message.content.startsWith("$autobot") &&
        message.author.id === config.OwnerID
    ) {
        handleBotCommand(client, message);
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