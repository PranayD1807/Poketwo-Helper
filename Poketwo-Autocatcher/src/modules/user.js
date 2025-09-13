/**
 * @typedef {Object} DiscordUserInfo
 * @property {string} id
 * @property {string} displayName
 * @property {string} tag
 */

/** @type {DiscordUserInfo | null} */
let discordUserInfo = null;

/**
 * @param {DiscordUserInfo} userInfo
 */
export const loadDiscordUserInfo = (userInfo) => {
    discordUserInfo = userInfo;
    console.log(`✅ Bot Info Loaded: Id: ${userInfo.id}, Tag: ${userInfo.tag}, Name: ${userInfo.displayName}`);
};

/**
 * @returns {DiscordUserInfo | null}
 */
export const getDiscordUserInfo = () => {
    return discordUserInfo;
};
