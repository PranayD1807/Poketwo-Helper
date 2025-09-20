import pokeHint from 'pokehint';
const { solveHint } = pokeHint;
import { capturePokemon, getCaptureStatus } from "./capturePokemon.js";
import { getDiscordUserInfo } from './user.js';
import { getBotConfig, updateBotConfig } from "../utils/config.js";

export const handlePoketwoMessage = async (client, message) => {
    try {
        const botConfig = getBotConfig(client.user.id);
        if (!botConfig) return;

        const isCapturing = getCaptureStatus(client.user.id);

        // Wrong Pokemon, Ask Hint
        if (message.content === "That is the wrong pokémon!" && isCapturing) {
            message.channel.send(`<@716390085896962058> h`);
            return;
        }

        // Hint Given, Try to Catch
        if (message.content.includes("The pokémon is") && isCapturing) {
            const pokemon = solveHint(message);
            capturePokemon(client, message, pokemon[0]);
            return;
        }

        const botInfo = getDiscordUserInfo(client.user.id);

        // Level 100 reached embed detection
        if (
            message.embeds.length > 0 &&
            message.embeds[0].title &&
            message.embeds[0].description &&
            message.embeds[0].title.includes(`Congratulations ${botInfo.displayName}`) &&
            message.embeds[0].description.includes("is now level 100")
        ) {
            console.log(`⭐ ${new Date().toLocaleTimeString()} | A pokemon has reached level 100!`);
            await message.channel.send(`<@716390085896962058> i`);
            return;
        }

        // Next pokemon max list selection
        if (
            message.embeds.length > 0 &&
            message.embeds[0]?.title?.includes(`Level 100`) &&
            message.reference?.messageId
        ) {
            const referenceMessage = await message.channel.messages.fetch(message.reference.messageId);
            if (
                !(referenceMessage?.author?.id === botInfo.id &&
                    referenceMessage?.content === '<@716390085896962058> i')
            ) return;

            // Use botConfig.toMaxList safely
            let toMaxList = Array.isArray(botConfig.toMaxList) ? [...botConfig.toMaxList] : [];
            const logChannel = botConfig.logChannelID ? client.channels.cache.get(botConfig.logChannelID) : null;

            // Detect if current pokemon is from the max list or a different one
            const nextPokemon = toMaxList.length > 0 ? toMaxList[0] : null;

            if (
                message.embeds[0]?.footer?.text?.includes(`Displaying pokémon ${nextPokemon}`)
            ) {
                // Remove first pokemon from toMaxList
                toMaxList.shift();
                await updateBotConfig(botConfig.botId, { toMaxList });

                if (logChannel) {
                    await logChannel.send(`✅ Removed ${nextPokemon} from toMaxList as it reached level 100`);
                }
                console.log(`✅ ${new Date().toLocaleTimeString()} | Removed ${nextPokemon} from toMaxList as it reached level 100`);
            }

            // Refresh next pokemon after shift
            const nextToPokemon = toMaxList.length > 0 ? toMaxList[0] : null;
            if (nextToPokemon) {
                if (logChannel) {
                    await logChannel.send(`✅ Selected next pokemon to max: **${nextToPokemon}**`);
                }
                console.log(`✅ ${new Date().toLocaleTimeString()} | Selected next pokemon to max: ${nextToPokemon}`);
                await message.channel.send(`<@716390085896962058> s ${nextToPokemon}`);
            }
            return;
        }
    } catch (error) {
        console.error("HandlePoketwoMessage error:", error);
        const botConfig = getBotConfig(client.user.id);
        const errorChannel = botConfig?.errorChannelID ? client.channels.cache.get(botConfig.errorChannelID) : null;
        if (errorChannel) await errorChannel.send(`Error in handlePoketwoMessage: ${error.message}`);
    }
};
