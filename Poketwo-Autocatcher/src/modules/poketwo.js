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

        // Check for Spawns Remaining and Ask Hint
        if (message?.embeds[0]?.footer?.text.includes("Spawns Remaining")) {
            await message.channel.send(`<@716390085896962058> h`);
            if (
                message.embeds[0]?.footer?.text ===
                "Incense: Active.\nSpawns Remaining: 0."
            ) {
                message.channel.send(`<@716390085896962058> buy incense`);
            }
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
