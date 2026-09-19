/**
 * WhatsApp Auto-React & Command Bot
 * Powered by @whiskeysockets/baileys
 * 
 * Features:
 * - Pairing Code connection (No QR needed, just enter phone number)
 * - Dynamic Prefix changer (.apply prefix #)
 * - Speed ping command (.ping)
 * - Auto-react to messages from 0764802314 (94764802314)
 * - Custom reaction emoji customizer (.apply 👑, 👑)
 * - Interactive Settings menu (.setting)
 */

import {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  delay
} from '@whiskeysockets/baileys';
import pino from 'pino';
import readline from 'readline';
import { botConfig, saveConfig } from './config.js';
import { handlePing } from './commands/ping.js';
import { handleApply } from './commands/apply.js';
import { handleSetting } from './commands/setting.js';
import { handleMode } from './commands/mode.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function startWhatsAppBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./session');
  const { version, isLatest } = await fetchLatestBaileysVersion();
  console.log('[BOT] Starting ' + botConfig.botName + ' (Baileys v' + version.join('.') + ')...');

  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    auth: state,
    browser: ['Ubuntu', 'Chrome', '20.0.04']
  });

  // Handle Pairing Code if not registered yet
  if (!sock.authState.creds.registered) {
    console.log('\x1b[33m[PAIRING]\x1b[0m No session found. Pairing with phone number...');
    const phoneNumber = await question('\x1b[32m[?] Enter your WhatsApp phone number with country code (e.g. 94764802314): \x1b[0m');
    const cleanedNumber = phoneNumber.replace(/[^0-9]/g, '');
    
    await delay(3000);
    const code = await sock.requestPairingCode(cleanedNumber);
    console.log('\x1b[35m╔══════════════════════════════════════════╗\x1b[0m');
    console.log('\x1b[35m║\x1b[0m YOUR WHATSAPP PAIRING CODE: \x1b[32m' + code + '\x1b[0m       \x1b[35m║\x1b[0m');
    console.log('\x1b[35m║\x1b[0m Enter this code on WhatsApp Linked Devices \x1b[35m║\x1b[0m');
    console.log('\x1b[35m╚══════════════════════════════════════════╝\x1b[0m');
  }

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('[BOT] Connection closed. Reconnecting: ' + shouldReconnect);
      if (shouldReconnect) {
        startWhatsAppBot();
      }
    } else if (connection === 'open') {
      console.log('\x1b[32m[BOT]\x1b[0m ✅ WhatsApp Bot successfully connected and online!');
      console.log('[CONFIG] Active Prefix: ' + botConfig.prefix + ' | Target: ' + botConfig.targetNumber + ' | React: ' + (botConfig.autoReactEnabled ? 'ON' : 'OFF'));
    }
  });

  // Listen to incoming messages
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const msg of messages) {
      if (!msg.message) continue;

      const remoteJid = msg.key.remoteJid || '';
      const isGroup = remoteJid.endsWith('@g.us');
      const senderJid = isGroup ? (msg.key.participant || remoteJid) : remoteJid;
      const senderNumber = senderJid.split('@')[0].replace(/\D/g, '');

      // Extract message text
      const text = msg.message.conversation ||
                   msg.message.extendedTextMessage?.text ||
                   msg.message.imageMessage?.caption ||
                   msg.message.videoMessage?.caption || '';

      const cleanTargetNumber = botConfig.targetNumber.replace(/\D/g, '');
      const internationalTargetNum = cleanTargetNumber.startsWith('0')
        ? '94' + cleanTargetNumber.slice(1)
        : cleanTargetNumber;

      // 👑 1. AUTO-REACT LOGIC FOR:
      // A) OUR OWN MESSAGES (fromMe === true): Automatically reacts with 👑 to messages we send!
      // B) TARGET NUMBER (0764802314): Automatically reacts when target sends a message!
      const isFromMe = msg.key.fromMe;
      const isTargetSender = senderNumber === cleanTargetNumber || 
                             senderNumber === internationalTargetNum ||
                             (cleanTargetNumber.endsWith(senderNumber.slice(-9)));

      const shouldAutoReact = botConfig.autoReactEnabled && (
        (isFromMe && (botConfig.reactOnMyMessages ?? true)) || 
        isTargetSender
      );

      if (shouldAutoReact) {
        try {
          const singleEmoji = (botConfig.reactEmojis && botConfig.reactEmojis[0]) || '👑';
          await sock.sendMessage(remoteJid, {
            react: {
              text: singleEmoji.trim(),
              key: msg.key
            }
          });
          console.log('[AUTO-REACT] Reacted single emoji ' + singleEmoji + ' to ' + (isFromMe ? 'OUR OWN message' : ('target ' + senderNumber)));
        } catch (err) {
          console.error('[AUTO-REACT ERROR]', err);
        }
      }

      // ⚙️ 2. COMMAND HANDLING (Supports prefix, numbered menu replies 1 on, 1.2 off, 7.1-7.4, and .mode)
      const currentPrefix = botConfig.prefix;
      const isPrefixed = text.startsWith(currentPrefix);
      const isNumberedReply = /^(1(s+on)?|1.1|1.2(s+off)?|1s+off|2(s+on)?|2.1|2.2(s+off)?|2s+off|3(s+d+)?|4(s+S+)?|5(s+[#!/?@.])?|6|7(s+(public|private|inbox|group|[1-4]))?|7.[1-4]|mode(s+(public|private|inbox|group))?)$/i.test(text.trim());

      if (isPrefixed || isNumberedReply) {
        const fullCommand = isPrefixed ? text.slice(currentPrefix.length).trim() : ('setting ' + text.trim());
        const args = fullCommand.split(/s+/);
        const commandName = args.shift()?.toLowerCase();

        // 🔒 WORK MODE PERMISSION CHECK (public, private, inbox, group)
        const isOwner = msg.key.fromMe || senderNumber === cleanTargetNumber || senderNumber === internationalTargetNum;
        const isModeOrSettingCmd = commandName === 'setting' || commandName === 'settings' || commandName === 'mode';

        // Check 1: Private Mode - Only owner can use commands
        if (!isOwner && botConfig.workMode === 'private') {
          await sock.sendMessage(remoteJid, {
            text: '🔒 *COMMAND BLOCKED [PRIVATE MODE]*\n\nබොට් දැනට Private Mode එකේ ක්‍රියාත්මක වේ. බොට් හිමිකරුට (Admin/Owner) පමණක් කමාන්ඩ් භාවිතා කළ හැක.'
          }, { quoted: msg });
          continue;
        }

        // Check 2: Inbox Only Mode - Commands disabled in WhatsApp groups
        if (!isModeOrSettingCmd && botConfig.workMode === 'inbox' && isGroup) {
          await sock.sendMessage(remoteJid, {
            text: '💬 *COMMAND RESTRICTED [INBOX ONLY]*\n\nබොට් දැනට Inbox Only Mode එකේ ක්‍රියාත්මක වේ. WhatsApp Groups තුළ කමාන්ඩ් භාවිතා කළ නොහැක.'
          }, { quoted: msg });
          continue;
        }

        // Check 3: Group Only Mode - Commands disabled in Personal Inbox/DM
        if (!isModeOrSettingCmd && botConfig.workMode === 'group' && !isGroup) {
          await sock.sendMessage(remoteJid, {
            text: '👥 *COMMAND RESTRICTED [GROUP ONLY]*\n\nබොට් දැනට Group Only Mode එකේ ක්‍රියාත්මක වේ. Personal Inbox තුළ කමාන්ඩ් වැඩ නොකරයි. WhatsApp Group එකකදී උත්සාහ කරන්න.'
          }, { quoted: msg });
          continue;
        }

        const context = {
          sock,
          msg,
          remoteJid,
          senderNumber,
          isGroup,
          text,
          args,
          currentPrefix,
          startTime: Date.now()
        };

        switch (commandName) {
          case 'ping':
            await handlePing(context);
            break;

          case 'apply':
            await handleApply(context);
            break;

          case 'mode':
            await handleMode(context);
            break;

          case 'setting':
          case 'settings':
            await handleSetting(context);
            break;

          default:
            break;
        }
      }
    }
  });
}

startWhatsAppBot().catch((err) => console.error('[FATAL ERROR]', err));
