/**
 * Bot Configuration
 * Dynamic settings with auto-save to config.json
 */
import fs from 'fs';
import path from 'path';

const CONFIG_PATH = path.join(process.cwd(), 'config.json');

const defaultConfig = {
  prefix: ".",
  allowedPrefixes: [".","#","!","/","?","@"],
  targetNumber: "0764802314", // Number to auto-react to (e.g. 0764802314)
  autoReactEnabled: true,
  reactOnMyMessages: true, // Auto-react 👑 to our own sent messages
  reactEmojis: ["👑","👑"],
  botName: "WA Auto-React Bot",
  ownerNumber: "0764802314",
  workMode: "public"
};

export let botConfig = { ...defaultConfig };

// Load persistent config if present
if (fs.existsSync(CONFIG_PATH)) {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
    botConfig = { ...defaultConfig, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Failed to parse config.json, using defaults');
  }
}

export function saveConfig() {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(botConfig, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error('Failed to save config.json', e);
    return false;
  }
}
