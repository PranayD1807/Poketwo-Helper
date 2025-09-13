import pokeHint from 'pokehint';
const { solveHint } = pokeHint;
import { capturePokemon } from "./capturePokemon.js";
import { getDiscordUserInfo } from './user.js';

export const handlePoketwoMessage = async (client, message) => {
    try {
        // Wrong Pokemon, Ask Hint
        if (message.content === "That is the wrong pokémon!") {
            message.channel.send(`<@716390085896962058> h`);
            return;
        }

        // Hint Given, Try to Catch
        if (message.content.includes("The pokémon is")) {
            const pokemon = solveHint(message);
            capturePokemon(client, message, pokemon[0]);
            return;
        }

        const botInfo = getDiscordUserInfo()
    
        if (message.embeds.length > 0
            && message.embeds[0].title
            && message.embeds[0].description
            && message.embeds[0].title.includes(`Congratulations ${botInfo.displayName}`)
            && message.embeds[0].description.includes("is now level 100")
        ) {
            // A pokemon has reached level 100
            console.log(`⭐ ${new Date().toLocaleTimeString()} | A pokemon has reached level 100!`);
            return;
        }
    } catch (error) {
        console.error("HandlePokeNameMessage error:", error);
        const errorChannel = client.channels.cache.get(config.errorChannelID);
        if (errorChannel) await errorChannel.send(`Error in handlePokeNameMessage: ${error.message}`);
    }
};
