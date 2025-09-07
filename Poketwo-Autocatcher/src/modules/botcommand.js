import { startSpamming, stopSpamming } from "./spam.js";

const helpText = `
### 🤖 Autobot Commands

> \`$autobot spam start\`: Start spamming messages
> \`$autobot spam stop\`: Stop spamming messages
> \`$autobot help\`: Show this help message
`;

export const handleBotCommand = (client, message) => {
    if (message.content === "$autobot help") {
        message.channel.send(helpText)
        return;
    }

    if (message.content === "$autobot spam start") {
        startSpamming(client, message);
        return;
    }

    if (message.content === "$autobot spam stop") {
        stopSpamming(client, message);
        return;
    }
}