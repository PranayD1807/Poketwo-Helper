import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import config from "../../config.json" with { type: "json" };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configFilePath = path.resolve(__dirname, "../../config.json");

export const getBots = () => {
  return config;
};

export const getBotConfig = (botId) => {
  const botConfig = config.find(bot => bot.botId === botId) || null;
  if (!botConfig) return null;

  if (!Array.isArray(botConfig.tags)) botConfig.tags = [];
  if (!Array.isArray(botConfig.toMaxList)) botConfig.toMaxList = [];
  if (!Array.isArray(botConfig.catchChannelIds)) botConfig.catchChannelIds = [];

  return botConfig;
};

// Make updateBotConfig asynchronous using fs/promises
export const updateBotConfig = async (botId, updatedFields) => {
  const configIndex = config.findIndex(bot => bot.botId === botId);
  if (configIndex === -1) return false;

  config[configIndex] = { ...config[configIndex], ...updatedFields };

  // Asynchronously write updated config to file
  await fs.writeFile(configFilePath, JSON.stringify(config, null, 2), "utf8");

  return config[configIndex];
};
