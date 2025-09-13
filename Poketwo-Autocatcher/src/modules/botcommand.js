import { disableAutoCatcher, enableAutoCatcher } from "./capturePokemon.js";
import { startSpamming, stopSpamming } from "./spam.js";
import config from "../../config.json" with { type: "json" };
import fs from "fs/promises";
import { toggleIncenseMode } from "./pokename.js";
import { extractChannelId } from "../utils/common.js";

// Normalize config arrays
if (!Array.isArray(config.tags)) config.tags = [];
if (!Array.isArray(config.toMaxList)) config.toMaxList = [];
if (!Array.isArray(config.catchChannelIds)) config.catchChannelIds = [];

const helpText = `
**🤖 Mellow Bot Commands**

> \`$mb spam start\`: Start spamming messages  
> \`$mb spam stop\`: Stop spamming messages  
> \`$mb catch start\`: Start Auto Catcher  
> \`$mb catch stop\`: Stop Auto Catcher  
> \`$mb say [text]\`: Make the mb say something  
> \`$mb click [text|emoji]\`: Click a button on the replied message  
> \`$mb incense toggle\`: Toggle Incense Mode (faster Pokémon catching)  

**📦 Max Queue Commands**  
When the current Pokémon is maxed, the first Pokémon in the Max Queue will be automatically selected, so it starts leveling up.

> \`$mb max add [number]\`: Add a Pokémon to the Max Queue
> \`$mb max remove [number]\`: Remove a Pokémon from the Max Queue
> \`$mb max move [from] [to]\`: Reorder the Max Queue
> \`$mb max list\`: Show all Pokémon in the Max Queue

**🏷️ Tag Commands**  
When a pokemon is caught, if its name or rarity matches any of the tags, the bot owner will be mentioned in the log channel.

> \`$mb tag list\`: List all tags  
> \`$mb tag rarities\`: List recognized Pokétwo rarities  
> \`$mb tag add [tag]\`: Add a tag
> \`$mb tag remove [tag]\`: Remove a tag

**⚙️ Configs**
If a config is not set, the bot will not function properly.
If catch channels are not set, the bot will attempt to catch in all channels.

> \'$mb config show\`: Show current configs
> \`$mb config spam [channelID]\`: Set the spam channel  
> \`$mb config log [channelID]\`: Set the log channel  
> \`$mb config error [channelID]\`: Set the error log channel
> \`$mb config catch add [channelID]\`: Add a channel to auto catch list  
> \`$mb config catch remove [channelID]\`: Remove a channel from auto catch list  

**❓ Help**

> \`$mb help\`: Show this help message  
`;

const rarities = [
    "Legendary",
    "Mythical",
    "Ultra Beast",
    "Regional",
    "Event",
    "Gigantamax",
    "Regular"
];

async function saveConfig() {
    await fs.writeFile("./config.json", JSON.stringify(config, null, 2));
}


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
    const text = message.content.slice("$mb say".length).trim();
    if (text) {
        await message.channel.send(text);
    }
}


async function cmdAddTag(message) {
    const tag = message.content.slice("$mb tag add".length).trim();
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
    const tag = message.content.slice("$mb tag remove".length).trim();
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

async function cmdListTags(message) {
    if (config.tags.length === 0) {
        await message.channel.send("⚠️ No tags set.");
        return;
    }
    const tagList = config.tags.map((tag, index) => `${index + 1}. ${tag}`).join("\n");
    await message.channel.send(`### 📋 Current Tags:\n${tagList}`);
}

async function cmdListRarities(message) {
    const rarityList = rarities.map((rarity, index) => `${index + 1}. ${rarity}`).join("\n");
    await message.channel.send(`### 📋 Recognized Rarities:\n${rarityList}`);
}


async function cmdMaxAdd(message) {
    const input = message.content.slice("$mb max add".length).trim();
    const num = parseInt(input);
    if (isNaN(num) || num <= 0) {
        await message.channel.send(`⚠️ Invalid Pokémon number. Must be a positive integer.`);
        return;
    }

    if (!config.toMaxList.includes(num)) {
        config.toMaxList.push(num);
        await saveConfig();
        await message.channel.send(`✅ Added Pokémon #${num} to the toMaxList.`);
    } else {
        await message.channel.send(`⚠️ Pokémon #${num} is already in the toMaxList.`);
    }
}

async function cmdMaxRemove(message) {
    const input = message.content.slice("$mb max remove".length).trim();
    const num = parseInt(input);

    if (isNaN(num)) {
        await message.channel.send(`⚠️ Invalid Pokémon number.`);
        return;
    }

    const index = config.toMaxList.indexOf(num);
    if (index !== -1) {
        config.toMaxList.splice(index, 1);
        await saveConfig();
        await message.channel.send(`✅ Removed Pokémon #${num} from the toMaxList.`);
    } else {
        await message.channel.send(`⚠️ Pokémon #${num} not found in the toMaxList.`);
    }
}

async function cmdMaxMove(message) {
    const args = message.content.slice("$mb max move".length).trim().split(/\s+/);
    const fromIndex = parseInt(args[0]) - 1;
    const toIndex = parseInt(args[1]) - 1;

    if (
        isNaN(fromIndex) || isNaN(toIndex) ||
        fromIndex < 0 || toIndex < 0 ||
        fromIndex >= config.toMaxList.length || toIndex >= config.toMaxList.length
    ) {
        await message.channel.send("⚠️ Invalid indices. Use: `$mb max move [from] [to]` (1-based index)");
        return;
    }

    const [moved] = config.toMaxList.splice(fromIndex, 1);
    config.toMaxList.splice(toIndex, 0, moved);

    await saveConfig();
    await message.channel.send(`✅ Moved Pokémon #${moved} from position ${fromIndex + 1} to ${toIndex + 1}.`);
}

async function cmdMaxList(message) {
    if (config.toMaxList.length === 0) {
        await message.channel.send("⚠️ toMaxList is empty.");
        return;
    }

    const list = config.toMaxList.map((num, index) => `${index + 1}. #${num}`).join("\n");
    await message.channel.send(`### 📦 Current toMaxList:\n${list}`);
}

async function cmdConfigShow(message) {
    const response = `### ⚙️ Current Configs:
- Spam Channel: <#${config.spamChannelID || "Not set"}>
- Log Channel: <#${config.logChannelID || "Not set"}>
- Error Channel: <#${config.errorChannelID || "Not set"}>
- Auto Catch Channels: ${config.catchChannelIds.length > 0
            ? config.catchChannelIds.map(id => `<#${id}>`).join(", ")
            : "None"
        }`;
    await message.channel.send(response);
}

async function cmdConfigSetSpam(message) {
    const arg = message.content.slice("$mb config spam".length).trim();
    const channelID = extractChannelId(arg);
    
    if (!channelID) {
        await message.channel.send("❌ Please mention a valid channel (e.g., <#1234567890>).");
        return;
    }

    config.spamChannelID = channelID;
    await saveConfig();
    await message.channel.send(`✅ Spam channel set to <#${channelID}>.`);
}

async function cmdConfigSetLog(message) {
    const arg = message.content.slice("$mb config log".length).trim();
    const channelID = extractChannelId(arg);

    if (!channelID) {
        await message.channel.send("❌ Please mention a valid channel.");
        return;
    }

    config.logChannelID = channelID;
    await saveConfig();
    await message.channel.send(`✅ Log channel set to <#${channelID}>.`);
}

async function cmdConfigSetError(message) {
    const arg = message.content.slice("$mb config error".length).trim();
    const channelID = extractChannelId(arg);

    if (!channelID) {
        await message.channel.send("❌ Please mention a valid channel.");
        return;
    }

    config.errorChannelID = channelID;
    await saveConfig();
    await message.channel.send(`✅ Error channel set to <#${channelID}>.`);
}

async function cmdConfigCatchAdd(message) {
    const arg = message.content.slice("$mb config catch add".length).trim();
    const channelID = extractChannelId(arg);

    if (!channelID) {
        await message.channel.send("❌ Please mention a valid channel.");
        return;
    }

    if (config.catchChannelIds.includes(channelID)) {
        await message.channel.send("⚠️ Channel is already in the auto catch list.");
        return;
    }

    config.catchChannelIds.push(channelID);
    await saveConfig();
    await message.channel.send(`✅ Added <#${channelID}> to auto catch list.`);
}

async function cmdConfigCatchRemove(message) {
    const arg = message.content.slice("$mb config catch remove".length).trim();
    const channelID = extractChannelId(arg);

    if (!channelID) {
        await message.channel.send("❌ Please mention a valid channel.");
        return;
    }

    const index = config.catchChannelIds.indexOf(channelID);
    if (index === -1) {
        await message.channel.send("⚠️ Channel not found in the auto catch list.");
        return;
    }

    config.catchChannelIds.splice(index, 1);
    await saveConfig();
    await message.channel.send(`✅ Removed <#${channelID}> from auto catch list.`);
}

// ─── Click Command ───────────────────────────────────────────

async function cmdClick(message) {
    const buttonText = message.content.slice("$mb click".length).trim();

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
            } else if (c.emoji?.name?.toLowerCase().includes(lowerText)) {
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
    const content = message.content.trim();

    if (content === "$mb help") return cmdHelp(message);
    if (content === "$mb spam start") return cmdSpamStart(client, message);
    if (content === "$mb spam stop") return cmdSpamStop(client, message);
    if (content === "$mb catch start") return cmdCaptureStart(message);
    if (content === "$mb catch stop") return cmdCaptureStop(message);
    if (content.startsWith("$mb say")) return cmdSay(message);
    if (content.startsWith("$mb click")) return cmdClick(message);

    if (content.startsWith("$mb tag add")) return cmdAddTag(message);
    if (content.startsWith("$mb tag remove")) return cmdRemoveTag(message);
    if (content === "$mb tag list") return cmdListTags(message);
    if (content === "$mb tag rarities") return cmdListRarities(message);

    if (content.startsWith("$mb max add")) return cmdMaxAdd(message);
    if (content.startsWith("$mb max remove")) return cmdMaxRemove(message);
    if (content.startsWith("$mb max move")) return cmdMaxMove(message);
    if (content === "$mb max list") return cmdMaxList(message);

    if (content === "$mb config show") return cmdConfigShow(message);
    if (content.startsWith("$mb config spam")) return cmdConfigSetSpam(message);
    if (content.startsWith("$mb config log")) return cmdConfigSetLog(message);
    if (content.startsWith("$mb config error")) return cmdConfigSetError(message);
    if (content.startsWith("$mb config catch add")) return cmdConfigCatchAdd(message);
    if (content.startsWith("$mb config catch remove")) return cmdConfigCatchRemove(message);

    if (content === "$mb incense toggle") return toggleIncenseMode(message);
};
