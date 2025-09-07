import fs from "fs";
import path from "path";

export const updateStats = (messages = 0, captures = 0) => {
    const filePath = path.join(process.cwd(), "stats.json");
    let stats = { messages: 0, captures: 0 };

    if (fs.existsSync(filePath)) {
        stats = JSON.parse(fs.readFileSync(filePath, "utf8"));
    }

    stats.messages += messages;
    stats.captures += captures;

    fs.writeFileSync(filePath, JSON.stringify(stats, null, 2));
    return stats;
}