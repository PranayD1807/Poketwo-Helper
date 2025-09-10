import { disableAutoCatcher, enableAutoCatcher } from "./capturePokemon.js";
import { startSpamming, stopSpamming } from "./spam.js";
import config from "../../config.json" with { type: "json" };
import fs from "fs/promises";
import { toggleIncenseMode } from "./pokename.js";

const helpText = `
### 🤖 Autobot Commands

> \`$autobot spam start\`: Start spamming messages  
> \`$autobot spam stop\`: Stop spamming messages  
> \`$autobot catch start\`: Start Auto Catcher 
> \`$autobot catch stop\`: Stop Auto Catcher  
> \`$autobot say [text]\`: Make the autobot say something  
> \`$autobot click [text|emoji]\`: Click a button on the replied message  
> \`$autobot incense toggle\`: Toggle Incense Mode (makes the bot catch pokemons faster)
> \`$autobot tag list\`: List all tags
> \`$autobot tag rarities\`: List all recognized rarities in Pokétwo
> \`$autobot tag add [tag]\`: Add a tag to the tag list (used in Auto Catcher), Notifies when a pokemon with the tag in its name or rarity appears.
> \`$autobot tag remove [tag]\`: Remove a tag from the tag list
> \`$autobot help\`: Show this help message  
`;

// Following are the rarities in Pokétwo
const rarities = [
    "Legendary",
    "Mythical",
    "Ultra Beast",
    "Regional",
    "Event",
    "Gigantamax",
    "Regular"
]

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

async function cmdCaptureStart(message) {
    enableAutoCatcher(message);
}

async function cmdCaptureStop(message) {
    disableAutoCatcher(message);
}

async function cmdSay(message) {
    const text = message.content.slice("$autobot say".length).trim();
    if (text) {
        await message.channel.send(text);
    }
}


async function saveConfig() {
    await fs.writeFile("./config.json", JSON.stringify(config, null, 2));
}

async function cmdAddTag(message) {
    const tag = message.content.slice("$autobot tag add".length).trim();
    if (tag) {
        if (!config.tags.includes(tag)) {
            config.tags.push(tag);
            await saveConfig();
            await message.channel.send(`✅ Added tag: ${tag}`);
        } else {
            await message.channel.send(`⚠️ Tag already exists: ${tag}`);
        }
    }
}

async function cmdRemoveTag(message) {
    const tag = message.content.slice("$autobot tag remove".length).trim();
    if (tag) {
        const index = config.tags.indexOf(tag);
        if (index > -1) {
            config.tags.splice(index, 1);
            await saveConfig();
            await message.channel.send(`✅ Removed tag: ${tag}`);
        } else {
            await message.channel.send(`⚠️ Tag not found: ${tag}`);
        }
    }
}

async function listTags(comment) {
    if (config.tags.length === 0) {
        await comment.channel.send("⚠️ No tags set.");
        return;
    }
    const tagList = config.tags.map((tag, index) => `${index + 1}. ${tag}`).join("\n");
    await comment.channel.send(`### 📋 Current Tags:\n${tagList}`);    
}

async function listRarities(params) {
    const rarityList = rarities.map((rarity, index) => `${index + 1}. ${rarity}`).join("\n");
    await params.channel.send(`### 📋 Recognized Rarities:\n${rarityList}`);
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
    if (message.content === "$autobot catch start") return cmdCaptureStart(message);
    if (message.content === "$autobot catch stop") return cmdCaptureStop(message);
    if (message.content.startsWith("$autobot say")) return cmdSay(message);
    if (message.content.startsWith("$autobot click")) return cmdClick(message);
    if (message.content.startsWith("$autobot tag add")) return cmdAddTag(message);
    if (message.content.startsWith("$autobot tag remove")) return cmdRemoveTag(message);
    if (message.content === "$autobot tag list") return listTags(message);
    if (message.content === "$autobot tag rarities") return listRarities(message);
    if (message.content === "$autobot incense toggle") return toggleIncenseMode(message);
};
