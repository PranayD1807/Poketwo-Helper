import pokeHint from 'pokehint';
const { solveHint } = pokeHint;
import { capturePokemon } from "./capturePokemon.js";

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
            capturePokemon(client, message, pokemon);
        }
    } catch (error) {
        console.error("HandlePokeNameMessage error:", error);
        const errorChannel = client.channels.cache.get(config.errorChannelID);
        if (errorChannel) await errorChannel.send(`Error in handlePokeNameMessage: ${error.message}`);
    }
};
