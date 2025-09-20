import { disableAutoCatcher, enableAutoCatcher } from "./capturePokemon.js";
import { startSpamming, stopSpamming } from "./spam.js";
import { toggleIncenseMode } from "./pokename.js";
import { extractChannelId } from "../utils/common.js";
import { getBotConfig, updateBotConfig } from "../utils/config.js";

const helpText = `
**🤖 Commands**
> \`bots hi\`: Bot replies Hello! 
> \`{prefix} spam start\`: Start spamming messages  
> \`{prefix} spam stop\`: Stop spamming messages  
> \`{prefix} catch start\`: Start Auto Catcher  
> \`{prefix} catch stop\`: Stop Auto Catcher  
> \`{prefix} say [text]\`: Make the mb say something  
> \`{prefix} click [text|emoji]\`: Click a button on the replied message  
> \`{prefix} incense toggle\`: Toggle Incense Mode (faster Pokémon catching)  

**📦 Max Queue Commands**  
When the current Pokémon is maxed, the first Pokémon in the Max Queue will be automatically selected, so it starts leveling up.

> \`{prefix} max add [number]\`: Add a Pokémon to the Max Queue
> \`{prefix} max remove [number]\`: Remove a Pokémon from the Max Queue
> \`{prefix} max move [from] [to]\`: Reorder the Max Queue
> \`{prefix} max list\`: Show all Pokémon in the Max Queue

**🏷️ Tag Commands**  
When a pokemon is caught, if its name or rarity matches any of the tags, the bot owner will be mentioned in the log channel.

> \`{prefix} tag list\`: List all tags  
> \`{prefix} tag rarities\`: List recognized Pokétwo rarities  
> \`{prefix} tag add [tag]\`: Add a tag
> \`{prefix} tag remove [tag]\`: Remove a tag

**⚙️ Configs**
If a config is not set, the bot will not function properly.
If catch channels are not set, the bot will attempt to catch in all channels.

> \`{prefix} config show\`: Show current configs
> \`{prefix} config spam [channelID]\`: Set the spam channel  
> \`{prefix} config log [channelID]\`: Set the log channel  
> \`{prefix} config error [channelID]\`: Set the error log channel
> \`{prefix} config capture [channelID]\`: Set the capture logs channel  
> \`{prefix} config catch add [channelID]\`: Add a channel to auto catch list  
> \`{prefix} config catch remove [channelID]\`: Remove a channel from auto catch list  

**❓ Help**

> \`{prefix} help\`: Show this help message  
`;

const formatHelp = (prefix) => helpText.replace(/{prefix}/g, prefix);

const rarities = [
    "Legendary",
    "Mythical",
    "Ultra Beast",
    "Regional",
    "Event",
    "Gigantamax",
    "Regular"
];

async function cmdHelp(message, botConfig) {
    await message.channel.send(formatHelp(botConfig.prefix));
}

async function cmdSpamStart(client, message, botConfig) {
    startSpamming(client, message);
}

async function cmdSpamStop(client, message, botConfig) {
    stopSpamming(client, message);
}

async function cmdCaptureStart(message, botConfig) {
    enableAutoCatcher(message);
}

async function cmdCaptureStop(message, botConfig) {
    disableAutoCatcher(message);
}

async function cmdSay(message, botConfig) {
    const text = message.content.slice(`${botConfig.prefix} say`.length).trim();
    if (text) {
        await message.channel.send(text);
    }
}


async function cmdAddTag(message, botConfig) {
    const tag = message.content.slice(`${botConfig.prefix} tag add`.length).trim();
    if (tag) {
        if (!botConfig.tags.includes(tag)) {
            const updatedTags = [...botConfig.tags, tag];
            await updateBotConfig(botConfig.botId, { tags: updatedTags });
            await message.channel.send(`✅ Added tag: ${tag}`);
        } else {
            await message.channel.send(`⚠️ Tag already exists: ${tag}`);
        }
    }
}

async function cmdRemoveTag(message, botConfig) {
    const tag = message.content.slice(`${botConfig.prefix} tag remove`.length).trim();
    if (tag) {
        if (botConfig.tags.includes(tag)) {
            const updatedTags = botConfig.tags.filter(t => t !== tag);
            await updateBotConfig(botConfig.botId, { tags: updatedTags });
            await message.channel.send(`✅ Removed tag: ${tag}`);
        } else {
            await message.channel.send(`⚠️ Tag not found: ${tag}`);
        }
    }
}

async function cmdListTags(message, botConfig) {
    if (botConfig.tags.length === 0) {
        await message.channel.send("⚠️ No tags set.");
        return;
    }
    const tagList = botConfig.tags.map((tag, index) => `${index + 1}. ${tag}`).join("\n");
    await message.channel.send(`### 📋 Current Tags:\n${tagList}`);
}

async function cmdListRarities(message, botConfig) {
    const rarityList = rarities.map((rarity, index) => `${index + 1}. ${rarity}`).join("\n");
    await message.channel.send(`### 📋 Recognized Rarities:\n${rarityList}`);
}


async function cmdMaxAdd(message, botConfig) {
    const input = message.content.slice(`${botConfig.prefix} max add`.length).trim();
    const num = parseInt(input);
    if (isNaN(num) || num <= 0) {
        await message.channel.send(`⚠️ Invalid Pokémon number. Must be a positive integer.`);
        return;
    }

    if (!botConfig.toMaxList.includes(num)) {
        const updatedList = [...botConfig.toMaxList, num];
        await updateBotConfig(botConfig.botId, { toMaxList: updatedList });
        await message.channel.send(`✅ Added Pokémon #${num} to the toMaxList.`);
    } else {
        await message.channel.send(`⚠️ Pokémon #${num} is already in the toMaxList.`);
    }
}

async function cmdMaxRemove(message, botConfig) {
    const input = message.content.slice(`${botConfig.prefix} max remove`.length).trim();
    const num = parseInt(input);

    if (isNaN(num)) {
        await message.channel.send(`⚠️ Invalid Pokémon number.`);
        return;
    }

    if (botConfig.toMaxList.includes(num)) {
        const updatedList = botConfig.toMaxList.filter(n => n !== num);
        await updateBotConfig(botConfig.botId, { toMaxList: updatedList });
        await message.channel.send(`✅ Removed Pokémon #${num} from the toMaxList.`);
    } else {
        await message.channel.send(`⚠️ Pokémon #${num} not found in the toMaxList.`);
    }
}

async function cmdMaxMove(message, botConfig) {
    const args = message.content.slice(`${botConfig.prefix} max move`.length).trim().split(/\s+/);
    const fromIndex = parseInt(args[0]) - 1;
    const toIndex = parseInt(args[1]) - 1;

    if (
        isNaN(fromIndex) || isNaN(toIndex) ||
        fromIndex < 0 || toIndex < 0 ||
        fromIndex >= botConfig.toMaxList.length || toIndex >= botConfig.toMaxList.length
    ) {
        await message.channel.send(`⚠️ Invalid indices. Use: \`${botConfig.prefix} max move [from] [to]\` (1-based index)`);
        return;
    }

    const updatedList = [...botConfig.toMaxList];
    const [moved] = updatedList.splice(fromIndex, 1);
    updatedList.splice(toIndex, 0, moved);

    await updateBotConfig(botConfig.botId, { toMaxList: updatedList });
    await message.channel.send(`✅ Moved Pokémon #${moved} from position ${fromIndex + 1} to ${toIndex + 1}.`);
}

async function cmdMaxList(message, botConfig) {
    if (botConfig.toMaxList.length === 0) {
        await message.channel.send("⚠️ toMaxList is empty.");
        return;
    }

    const list = botConfig.toMaxList.map((num, index) => `${index + 1}. #${num}`).join("\n");
    await message.channel.send(`### 📦 Current toMaxList:\n${list}`);
}

async function cmdConfigShow(message, botConfig) {
    const response = `### ⚙️ Current Configs:
- Spam Channel: <#${botConfig.spamChannelID || "Not set"}>
- Log Channel: <#${botConfig.logChannelID || "Not set"}>
- Capture Logs Channel: <#${botConfig.captureChannelID || "Not Set"}>
- Error Channel: <#${botConfig.errorChannelID || "Not set"}>
- Auto Catch Channels: ${botConfig.catchChannelIds.length > 0
            ? botConfig.catchChannelIds.map(id => `<#${id}>`).join(", ")
            : "None"
        }`;
    await message.channel.send(response);
}

async function cmdConfigSetSpam(message, botConfig) {
    const arg = message.content.slice(`${botConfig.prefix} config spam`.length).trim();
    const channelID = extractChannelId(arg);

    if (!channelID) {
        await message.channel.send("❌ Please mention a valid channel (e.g., <#1234567890>).");
        return;
    }

    await updateBotConfig(botConfig.botId, { spamChannelID: channelID });
    await message.channel.send(`✅ Spam channel set to <#${channelID}>.`);
}

async function cmdConfigSetCapture(message, botConfig) {
    const arg = message.content.slice(`${botConfig.prefix} config capture`.length).trim();
    const channelID = extractChannelId(arg);

    if (!channelID) {
        await message.channel.send("❌ Please mention a valid channel (e.g., <#1234567890>).");
        return;
    }

    await updateBotConfig(botConfig.botId, { captureChannelID: channelID });
    await message.channel.send(`✅ Capture Logs channel set to <#${channelID}>.`);
}

async function cmdConfigSetLog(message, botConfig) {
    const arg = message.content.slice(`${botConfig.prefix} config log`.length).trim();
    const channelID = extractChannelId(arg);

    if (!channelID) {
        await message.channel.send("❌ Please mention a valid channel.");
        return;
    }

    await updateBotConfig(botConfig.botId, { logChannelID: channelID });
    await message.channel.send(`✅ Log channel set to <#${channelID}>.`);
}

async function cmdConfigSetError(message, botConfig) {
    const arg = message.content.slice(`${botConfig.prefix} config error`.length).trim();
    const channelID = extractChannelId(arg);

    if (!channelID) {
        await message.channel.send("❌ Please mention a valid channel.");
        return;
    }

    await updateBotConfig(botConfig.botId, { errorChannelID: channelID });
    await message.channel.send(`✅ Error channel set to <#${channelID}>.`);
}

async function cmdConfigCatchAdd(message, botConfig) {
    const arg = message.content.slice(`${botConfig.prefix} config catch add`.length).trim();
    const channelID = extractChannelId(arg);

    if (!channelID) {
        await message.channel.send("❌ Please mention a valid channel.");
        return;
    }

    if (botConfig.catchChannelIds.includes(channelID)) {
        await message.channel.send("⚠️ Channel is already in the auto catch list.");
        return;
    }

    const updatedList = [...botConfig.catchChannelIds, channelID];
    await updateBotConfig(botConfig.botId, { catchChannelIds: updatedList });
    await message.channel.send(`✅ Added <#${channelID}> to auto catch list.`);
}

async function cmdConfigCatchRemove(message, botConfig) {
    const arg = message.content.slice(`${botConfig.prefix} config catch remove`.length).trim();
    const channelID = extractChannelId(arg);

    if (!channelID) {
        await message.channel.send("❌ Please mention a valid channel.");
        return;
    }

    if (!botConfig.catchChannelIds.includes(channelID)) {
        await message.channel.send("⚠️ Channel not found in the auto catch list.");
        return;
    }

    const updatedList = botConfig.catchChannelIds.filter(id => id !== channelID);
    await updateBotConfig(botConfig.botId, { catchChannelIds: updatedList });
    await message.channel.send(`✅ Removed <#${channelID}> from auto catch list.`);
}

async function cmdClick(message, botConfig) {
    const buttonText = message.content.slice(`${botConfig.prefix} click`.length).trim();

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
    const botConfig = getBotConfig(client.user.id);
    if (!botConfig) return;
    const prefix = botConfig.prefix;
    if (!prefix) return;
    const content = message.content.trim();

    if (content === `${prefix} help`) return cmdHelp(message, botConfig);

    if (content === `${prefix} spam start`) return cmdSpamStart(client, message, botConfig);
    if (content === `${prefix} spam stop`) return cmdSpamStop(client, message, botConfig);
    if (content === `${prefix} catch start`) return cmdCaptureStart(message, botConfig);
    if (content === `${prefix} catch stop`) return cmdCaptureStop(message, botConfig);
    if (content.startsWith(`${prefix} say`)) return cmdSay(message, botConfig);
    if (content.startsWith(`${prefix} click`)) return cmdClick(message, botConfig);

    if (content.startsWith(`${prefix} tag add`)) return cmdAddTag(message, botConfig);
    if (content.startsWith(`${prefix} tag remove`)) return cmdRemoveTag(message, botConfig);
    if (content === `${prefix} tag list`) return cmdListTags(message, botConfig);
    if (content === `${prefix} tag rarities`) return cmdListRarities(message, botConfig);

    if (content.startsWith(`${prefix} max add`)) return cmdMaxAdd(message, botConfig);
    if (content.startsWith(`${prefix} max remove`)) return cmdMaxRemove(message, botConfig);
    if (content.startsWith(`${prefix} max move`)) return cmdMaxMove(message, botConfig);
    if (content === `${prefix} max list`) return cmdMaxList(message, botConfig);

    if (content === `${prefix} config show`) return cmdConfigShow(message, botConfig);
    if (content.startsWith(`${prefix} config capture`)) return cmdConfigSetCapture(message, botConfig);
    if (content.startsWith(`${prefix} config spam`)) return cmdConfigSetSpam(message, botConfig);
    if (content.startsWith(`${prefix} config log`)) return cmdConfigSetLog(message, botConfig);
    if (content.startsWith(`${prefix} config error`)) return cmdConfigSetError(message, botConfig);
    if (content.startsWith(`${prefix} config catch add`)) return cmdConfigCatchAdd(message, botConfig);
    if (content.startsWith(`${prefix} config catch remove`)) return cmdConfigCatchRemove(message, botConfig);

    if (content === `${prefix} incense toggle`) return toggleIncenseMode(message, botConfig);
};
