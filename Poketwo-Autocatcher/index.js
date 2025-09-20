import Discord from "discord.js-selfbot-v13";
import express from "express";
import config from "./config.json" with { type: "json" };
import chalk from "chalk";
import { handleIncomingMessage } from "./src/modules/message.handler.js";
import { loadDiscordUserInfo } from "./src/modules/user.js";
import { getBots, updateBotConfig } from "./src/utils/config.js";

const app = express();

if (Number(process.version.slice(1).split(".")[0]) < 8) {
    throw new Error(
        "Node 8.0.0 or higher is required. Update Node on your system."
    );
}

app.listen(process.env.PORT || 3000);

// Error Handling
const timestamp = () => new Date().toISOString();

process.on("unhandledRejection", (reason, p) => {
    console.log(chalk.red.bold(`[${timestamp()}] [antiCrash] Unhandled Rejection`));
    console.log(chalk.red(reason));
    if (p) {
        console.log(chalk.gray("Promise:"), p);
    }
    console.log("=".repeat(60));
});

process.on("uncaughtException", (err, origin) => {
    console.log(chalk.bgRed.white.bold(`[${timestamp()}] [antiCrash] Uncaught Exception`));
    console.log(chalk.red(err.stack || err));
    console.log(chalk.gray("Origin:"), origin);
    console.log("=".repeat(60));
});

process.on("uncaughtExceptionMonitor", (err, origin) => {
    console.log(chalk.bgYellow.black.bold(`[${timestamp()}] [antiCrash] Uncaught Exception (Monitor)`));
    console.log(chalk.yellow(err.stack || err));
    console.log(chalk.gray("Origin:"), origin);
    console.log("-".repeat(60));
});

process.on("multipleResolves", (type, promise, reason) => {
    console.log(chalk.magenta.bold(`[${timestamp()}] [antiCrash] Multiple Resolves`));
    console.log(chalk.magenta(`Type: ${type}`));
    console.log(chalk.magenta("Promise:"), promise);
    console.log(chalk.magenta("Reason:"), reason);
    console.log("-".repeat(60));
});

const initialiseBots = () => {
    const bots = getBots();
    bots.forEach((bot) => {
        if (bot.TOKEN && bot.botId && bot.prefix && bot.OwnerID) {
            const client = new Discord.Client({
                checkUpdate: false,
            });

            client.on("ready", () => {
                console.log(`Logged in as ${client.user.tag}!`);
                console.log(`Type ${bot.prefix} help for help menu`);
                loadDiscordUserInfo({
                    id: client.user.id,
                    displayName: client.user.displayName,
                    tag: client.user.tag,
                })
            });

            client.on("messageCreate", async (message) => {
                await handleIncomingMessage(client, message);
            });

            client.login(bot.TOKEN);
        } else {
            console.log("Please check TOKEN, botId, prefix and OwnerID in the config.")
        }
    });
}

initialiseBots()