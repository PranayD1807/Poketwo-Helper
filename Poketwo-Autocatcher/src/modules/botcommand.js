import { startSpamming, stopSpamming } from "./spam.js";

const helpText = `
### 🤖 Autobot Commands

> \`$autobot spam start\`: Start spamming messages  
> \`$autobot spam stop\`: Stop spamming messages  
> \`$autobot say [text]\`: Make the autobot say something  
> \`$autobot click [text|emoji]\`: Click a button on the replied message  
> \`$autobot help\`: Show this help message  
`;

// ─── Commands ───────────────────────────────────────────

async function cmdHelp(message) {
    await message.channel.send(helpText);
}

async function cmdSpamStart(client, message) {
    startSpamming(client, message);
}

async function cmdSpamStop(client, message) {
    stopSpamming(client, message);
}

async function cmdSay(message) {
    const text = message.content.slice("$autobot say".length).trim();
    if (text) {
        await message.channel.send(text);
    }
}

async function cmdClick(message) {
    const buttonText = message.content.slice("$autobot click".length).trim();

    if (!message.reference) {
        await message.channel.send("⚠️ Reply to the message that has the buttons.");
        return;
    }

    const targetMessage = await message.channel.messages.fetch(message.reference.messageId);
    if (!targetMessage || targetMessage.components.length === 0) {
        await message.channel.send("⚠️ That message has no buttons.");
        return;
    }

    const lowerText = buttonText.toLowerCase();
    let button;
    for (const row of targetMessage.components) {
        for (const c of row.components) {
            if (c.label && c.label.toLowerCase().includes(lowerText)) {
                button = c;
                break;
            } else if (c.emoji && c.emoji.name && c.emoji.name.toLowerCase().includes(lowerText)) {
                button = c;
                break;
            }
        }
        if (button) break;
    }

    if (!button) {
        await message.channel.send(`⚠️ No button with label "${buttonText}" found.`);
        return;
    }

    try {
        await targetMessage.clickButton(button.customId);
    } catch (err) {
        console.log(`⚠️ Failed to click ${buttonText} button.`);
        await message.channel.send(`⚠️ Failed to click ${buttonText} button.`);
    }
}

// ─── Router ───────────────────────────────────────────

export const handleBotCommand = async (client, message) => {
    if (message.content === "$autobot help") return cmdHelp(message);
    if (message.content === "$autobot spam start") return cmdSpamStart(client, message);
    if (message.content === "$autobot spam stop") return cmdSpamStop(client, message);
    if (message.content.startsWith("$autobot say")) return cmdSay(message);
    if (message.content.startsWith("$autobot click")) return cmdClick(message);
};
