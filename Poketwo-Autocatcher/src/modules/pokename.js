import config from "../../config.json" with { type: "json" };
import { extractPokemonName } from "../utils/common.js";
import { capturePokemon } from "./capturePokemon.js";


export const handlePokeNameMessage = async (client, message) => {
    try {
        const allowedChannels = config.catchChannelIds || [];

        if (allowedChannels.length > 0 && !allowedChannels.includes(message.channel.id)) return;

        if (message.embeds?.length > 0 && message.embeds[0].image) {
            await message.channel.send(
                "⚠️ Pokename textnaming is disabled! Please type `-toggle textnaming` to enable it."
            );
            return;
        }

        if (!message.content) return;

        const pokeName = extractPokemonName(message.content);
        if (!pokeName) return;

        const delay = (Math.floor(Math.random() * 6) + 5) * 1000;
        console.log(`🐸 A Pokemon Spawned, Catching in ${delay / 1000} seconds`);

        setTimeout(async () => {
            capturePokemon(client, message, pokeName);
        }, delay);

    } catch (error) {
        console.error("HandlePokeNameMessage error:", error);
        const errorChannel = client.channels.cache.get(config.errorChannelID);
        if (errorChannel) await errorChannel.send(`Error in handlePokeNameMessage: ${error.message}`);
    }
};

