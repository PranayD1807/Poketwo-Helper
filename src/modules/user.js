/**
 * @typedef {Object} DiscordUserInfo
 * @property {string} id
 * @property {string} displayName
 * @property {string} tag
 */

/** @type {Record<string, DiscordUserInfo>} */
let discordUsers = {};

/**
 * Load (add or update) user info for a given id.
 * @param {DiscordUserInfo} userInfo
 */
export const loadDiscordUserInfo = (userInfo) => {
    discordUsers[userInfo.id] = userInfo;
    console.log(`⏰ ${new Date().toLocaleTimeString()} | ✅ Bot Info Loaded: Id: ${userInfo.id}, Tag: ${userInfo.tag}, Name: ${userInfo.displayName}`);
};

/**
 * Retrieve info for a specific Discord user/bot by id.
 * @param {string} id
 * @returns {DiscordUserInfo | null}
 */
export const getDiscordUserInfo = (id) => {
    return discordUsers[id] || null;
};

/**
 * Optionally: Get all loaded user infos as an array.
 * @returns {DiscordUserInfo[]}
 */
export const getAllDiscordUserInfos = () => {
    return Object.values(discordUsers);
};
