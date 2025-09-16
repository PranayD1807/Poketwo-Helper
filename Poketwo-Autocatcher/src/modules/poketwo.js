import pokeHint from 'pokehint';
const { solveHint } = pokeHint;
import { capturePokemon, getCaptureStatus } from "./capturePokemon.js";
import { getDiscordUserInfo } from './user.js';
import fs from "fs/promises";
import config from "../../config.json" with { type: "json" };

async function saveConfig() {
    await fs.writeFile("./config.json", JSON.stringify(config, null, 2));
}

export const handlePoketwoMessage = async (client, message) => {
    try {
        const isCapturing = getCaptureStatus()
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

        const botInfo = getDiscordUserInfo()

        // If a pokemon reaches level 100, verify if its the selected pokemon
        if (message.embeds.length > 0
            && message.embeds[0].title
            && message.embeds[0].description
            && message.embeds[0].title.includes(`Congratulations ${botInfo.displayName}`)
            && message.embeds[0].description.includes("is now level 100")
        ) {
            // A pokemon has reached level 100
            console.log(`⭐ ${new Date().toLocaleTimeString()} | A pokemon has reached level 100!`);
            await message.channel.send(`<@716390085896962058> i`);
            return;
        }

        if (message.embeds.length > 0
            && message.embeds[0]?.title?.includes(`Level 100`)
            && message.reference?.messageId
        ) {
            const referenceMessage = await message.channel.messages.fetch(message.reference.messageId);
            const botInfo = getDiscordUserInfo()
            if (
                !(referenceMessage?.author?.id === botInfo.id
                    && referenceMessage?.content === '<@716390085896962058> i')
            ) return;

            // Pick 1st pokemon from maxQueue
            var nextPokemon = config.toMaxList.length > 0 ? config.toMaxList[0] : null;
            const logChannel = client.channels.cache.get(config.logChannelID);

            // Detect if current pokemon is from the max list or a different one
            if (message.embeds[0]?.footer?.text?.includes(`Displaying pokémon ${nextPokemon}`)) {
                // Current pokemon is from max list, so remove from the list
                config.toMaxList.shift();
                saveConfig();
                if (logChannel) await logChannel.send(`✅ Removed ${nextPokemon} from toMaxList as it reached level 100`);
                console.log(`✅ ${new Date().toLocaleTimeString()} | Removed ${nextPokemon} from toMaxList as it reached level 100`);
            }
            nextPokemon = config.toMaxList.length > 0 ? config.toMaxList[0] : null;
            if (nextPokemon) {
                if (logChannel) await logChannel.send(`✅ Selected next pokemon to max: **${nextPokemon}**`);
                console.log(`✅ ${new Date().toLocaleTimeString()} | Selected next pokemon to max: ${nextPokemon}`);
                await message.channel.send(`<@716390085896962058> s ${nextPokemon}`);
            }
            return;
        }

    } catch (error) {
        console.error("HandlePokeNameMessage error:", error);
        const errorChannel = client.channels.cache.get(config.errorChannelID);
        if (errorChannel) await errorChannel.send(`Error in handlePokeNameMessage: ${error.message}`);
    }
};
