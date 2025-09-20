# Poketwo-Helper 🤖🎮

Poketwo-Helper is a **Node.js selfbot tool** for Discord that automates and assists users with [Pokétwo](https://poketwo.net).  
It supports multiple bots with fully customizable settings and offers features such as auto-catching, spamming, logging, max queue leveling, and tag notifications.

---

### ✨ Features
- 🧩 **Multi-bot support** — run multiple accounts simultaneously with individual configurations.  
- 🎯 **Automated catching** — auto-catch Pokémon across all or specific channels per bot.  
- 💬 **Spam mode** — configurable spamming to trigger Pokémon spawns faster.  
- 📝 **Logging** — logs and error reports sent to Discord channels and console.  
- 🌟 **Pokémon Tags** — set tags like Legendary, Mythical, Gigantamax, etc., and get notified when matching Pokémon are caught.  
- 📌 **Auto-Leveling Queue** — maintain a max queue (`toMaxList`) that automatically switches when a Pokémon is maxed.  
- ⚙️ **Dynamic Config** — configure spam, catch, log, and error channels with commands (no manual config edits needed).  
- 🔄 **Incense Mode** — toggle a faster incense-based catch mode.  
- 🖱️ **Interactive Actions** — make bots click buttons or send custom messages.

---

### 🤖 Basic Commands Behavior

- When a user types:
  ```
  $bots hi
  ```
  the bot responds with:
  ```
  Hi <@OwnerID>! Type {prefix} help for the help menu
  ```
  where `{prefix}` is the bot’s command prefix.

- When a user types:
  ```
  {prefix} help
  ```
  the bot responds with a full command menu listing all available commands and their usage.

---

### ⚠️ Important Server Setup Note

Your Discord server **must have the "[PokéName](https://top.gg/bot/874910942490677270)" bot with text naming disabled** for Poketwo-Helper to work correctly.  
This is because Poketwo-Helper relies on the Pokémon name being in plain text format to detect and catch spawns accurately.  
If "text naming" is enabled, the bot may fail to recognize Pokémon names, causing missed catches.

---

### ⚙️ Installation

- Requires **Node.js 20+**.  
- Clone the repo and install dependencies:
  ```
  git clone https://github.com/PranayD1807/Poketwo-Helper
  cd Poketwo-Helper
  npm install
  ```
- Start the bot:
  ```
  node .
  ```
- On macOS, run with:
  ```
  caffeinate node .
  ```
  to prevent the process from sleeping.

---

### 📂 Configuration

Create a `config.json` file in the project root. This file is an **array of bot configs** allowing multiple accounts.

#### Required fields per bot:
- `"prefix"` — command prefix (e.g., `$gl`)  
- `"botId"` — Discord user ID of the bot/account  
- `"OwnerID"` — Your Discord user ID; the bot only responds to this user  
- `"TOKEN"` — Discord token for the account (**keep private!**)  

All other settings are optional and can be configured at runtime via commands.

---

#### Sample `config.json`
```
[
  {
    "prefix": "$gl",
    "botId": "YOUR_BOT_USER_ID_HERE",
    "OwnerID": "YOUR_DISCORD_USER_ID_HERE",
    "TOKEN": "YOUR_DISCORD_TOKEN_HERE"
  }
]
```

> Use the command `{prefix} config show` to view and configure spam, catch, log, and error channels dynamically.  
> No need to manually find or insert channel IDs into this file.

---

### 📜 Usage

- Start the bot:
  ```
  node . 
  ```
- Use prefix commands in Discord to configure and control the bot on the fly.

---

### 📦 Dependencies

- `discord.js-selfbot-v13` — Discord selfbot framework  
- `chalk` — Console colors  
- `express` — Lightweight web server (optional health/status)  
- `ocr-space-api-wrapper` — OCR for image text  
- `pokehint` — Pokétwo hint solver  

---

### ⚠️ Disclaimer

This tool is for **educational purposes only**.  
Using selfbots violates Discord’s [Terms of Service](https://discord.com/terms) and can result in **account suspension or banning**.  
Use at your own risk! 🚨
