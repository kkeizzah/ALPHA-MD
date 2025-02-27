"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
  var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const baileys_1 = __importStar(require("@whiskeysockets/baileys"));
const logger_1 = __importDefault(require("@whiskeysockets/baileys/lib/Utils/logger"));
const logger = logger_1.default.child({});
logger.level = 'silent';
const pino = require("pino");
const boom_1 = require("@hapi/boom");
const conf = require("./set");
const axios = require("axios");
const googleTTS = require('google-tts-api');
let fs = require("fs-extra");
let path = require("path");
const { DateTime } = require('luxon');
const FileType = require('file-type');
const { Sticker, createSticker, StickerTypes } = require('wa-sticker-formatter');
//import chalk from 'chalk'
const { verifierEtatJid , recupererActionJid } = require("./bdd/antilien");
const { atbverifierEtatJid , atbrecupererActionJid } = require("./bdd/antibot");
let evt = require(__dirname + "/keizzah/keith");
const {isUserBanned , addUserToBanList , removeUserFromBanList} = require("./bdd/banUser");
const  {addGroupToBanList,isGroupBanned,removeGroupFromBanList} = require("./bdd/banGroup");
const {isGroupOnlyAdmin,addGroupToOnlyAdminList,removeGroupFromOnlyAdminList} = require("./bdd/onlyAdmin");
//const //{loadCmd}=require("/keizzah/mesfonctions")
let { reagir } = require(__dirname + "/keizzah/app");
var session = conf.session.replace(/ALPHA-MD;;;=>/g,"");
const prefixe = conf.PREFIXE;
const express = require("express");
const app = express();
const port = process.env.PORT || 9090;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));


const zlib = require('zlib');

async function authentification() {
    try {
        if (!fs.existsSync(__dirname + "/auth/creds.json")) {
            console.log("Session connected...");
            // Split the session string into header and Base64 data
            const [header, b64data] = conf.session.split(';;;'); 

            // Validate the session format
            if (header === "ALPHA" && b64data) {
                let compressedData = Buffer.from(b64data.replace('...', ''), 'base64'); // Decode and truncate
                let decompressedData = zlib.gunzipSync(compressedData); // Decompress session
                fs.writeFileSync(__dirname + "/auth/creds.json", decompressedData, "utf8"); // Save to file
            } else {
                throw new Error("Invalid session format");
            }
        } else if (fs.existsSync(__dirname + "/auth/creds.json") && conf.session !== "zokk") {
            console.log("Updating existing session...");
            const [header, b64data] = conf.session.split(';;;'); 

            if (header === "ALPHA" && b64data) {
                let compressedData = Buffer.from(b64data.replace('...', ''), 'base64');
                let decompressedData = zlib.gunzipSync(compressedData);
                fs.writeFileSync(__dirname + "/auth/creds.json", decompressedData, "utf8");
            } else {
                throw new Error("Invalid session format");
            }
        }
    } catch (e) {
        console.log("Session Invalid: " + e.message);
        return;
    }
}
authentification();

const store = (0, baileys_1.makeInMemoryStore)({
    logger: pino().child({ level: "silent", stream: "store" }),
});
setTimeout(() => {
    async function main() {
        const { version, isLatest } = await (0, baileys_1.fetchLatestBaileysVersion)();
        const { state, saveCreds } = await (0, baileys_1.useMultiFileAuthState)(__dirname + "/auth");
        const sockOptions = {
            version,
            logger: pino({ level: "silent" }),
            browser: ['Alpha-Md', "safari", "1.0.0"],
            printQRInTerminal: true,
            fireInitQueries: false,
            shouldSyncHistoryMessage: true,
            downloadHistory: true,
            syncFullHistory: true,
            generateHighQualityLinkPreview: true,
            markOnlineOnConnect: false,
            keepAliveIntervalMs: 30_000,
            /* auth: state*/ auth: {
                creds: state.creds,
                /** caching makes the store faster to send/recv messages */
                keys: (0, baileys_1.makeCacheableSignalKeyStore)(state.keys, logger),
            },
            //////////
            getMessage: async (key) => {
                if (store) {
                    const msg = await store.loadMessage(key.remoteJid, key.id, undefined);
                    return msg.message || undefined;
                }
                return {
                    conversation: 'An Error Occurred, Repeat Command!'
                };
            }
            ///////
        };
        const zk = (0, baileys_1.default)(sockOptions);
        store.bind(zk.ev);
        setInterval(() => { store.writeToFile("store.json"); }, 3000);


const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Track the last text time to prevent overflow
let lastTextTime = 0;
const messageDelay = 5000; // Set the minimum delay between messages (in milliseconds)

zk.ev.on("call", async callData => {
  if (conf.ANTICALL === 'yes') {
    const callId = callData[0].id;
    const callerId = callData[0].from;
    const currentTime = Date.now();

    if (currentTime - lastTextTime >= messageDelay) {
      try {
        await zk.rejectCall(callId, callerId);
        await zk.sendMessage(callerId, {
          text: conf.ANTICALL_MSG
        });
        lastTextTime = currentTime;
      } catch (error) {
        console.error('Error handling call:', error);
      }
    } else {
      console.log('Message not sent due to delay constraint');
    }
  }
});
        
const isAnyBadWord = (message) => {
    // Load bad words from JSON file
    const badWordsPath = path.join(__dirname, 'database/antibad.json');
    const badWordsData = fs.readFileSync(badWordsPath);
    const badWords = JSON.parse(badWordsData).badWords;

    const messageLower = message.toLowerCase(); // Convert to lowercase for case-insensitive matching

    return badWords.some((word) => messageLower.includes(word));
};

zk.ev.on('messages.upsert', async (msg) => {
    try {
        const { messages } = msg;
        const message = messages[0];

        if (!message.message) return; // Skip empty messages

        const from = message.key.remoteJid; // Chat ID
        const sender = message.key.participant || message.key.remoteJid; // Sender ID
        const isGroup = from.endsWith('@g.us'); // Check if the message is from a group

        if (!isGroup) return; // Skip non-group messages

        const groupMetadata = await zk.groupMetadata(from); // Fetch group metadata
        const groupAdmins = groupMetadata.participants
            .filter((member) => member.admin)
            .map((admin) => admin.id);

        if (conf.GCF === 'yes') {
            const messageType = Object.keys(message.message)[0];
            const body =
                messageType === 'conversation'
                    ? message.message.conversation
                    : message.message[messageType]?.text || '';

            if (!body) return; // Skip if there's no text

            // Skip messages from admins
            if (groupAdmins.includes(sender)) return;

            // Check for any bad words
            if (isAnyBadWord(body)) {
                // Send a notification to the group
                await zk.sendMessage(from, {
                    text: `🚫 Bad word detected 🚫\n\n@${sender.split('@')[0]} using inappropriate language is prohibited.`,
                    mentions: [sender],
                });

                // Delete the message
                await zk.sendMessage(from, { delete: message.key });

                // Remove the sender from the group
                await zk.groupParticipantsUpdate(from, [sender], 'remove');
            }
        }
    } catch (err) {
        console.error('Error handling message:', err);
    }
});

       /* const isAnyTag = (message) => {
    // Check for the '@' symbol in the message
    return message.includes('@');
};

zk.ev.on('messages.upsert', async (msg) => {
    try {
        const { messages } = msg;
        const message = messages[0];

        if (!message.message) return; // Skip empty messages

        const from = message.key.remoteJid; // Chat ID
        const sender = message.key.participant || message.key.remoteJid; // Sender ID
        const isGroup = from.endsWith('@g.us'); // Check if the message is from a group

        if (!isGroup) return; // Skip non-group messages

        const groupMetadata = await zk.groupMetadata(from); // Fetch group metadata
        const groupAdmins = groupMetadata.participants
            .filter((member) => member.admin)
            .map((admin) => admin.id);

        if (conf.GCF === 'yes') {
            const messageType = Object.keys(message.message)[0];
            const body =
                messageType === 'conversation'
                    ? message.message.conversation
                    : message.message[messageType]?.text || '';

            if (!body) return; // Skip if there's no text

            // Skip messages from admins
            if (groupAdmins.includes(sender)) return;

            // Check for any '@' symbol (antitag)
            if (isAnyTag(body)) {
                // Send a notification to the group before action
                await zk.sendMessage(from, {
                    text: `🚫 Antitag detected 🚫\n\n@${sender.split('@')[0]} tagging others is prohibited.`,
                    mentions: [sender],
                });

                // Delete the message
                await zk.sendMessage(from, { delete: message.key });

                // Remove the sender from the group
                await zk.groupParticipantsUpdate(from, [sender], 'remove');
            }
        }
    } catch (err) {
        console.error('Error handling message:', err);
    }
});*/
        
        const isAnyLink = (message) => {
    // Regex pattern to detect any link
    const linkPattern = /https?:\/\/[^\s]+/;
    return linkPattern.test(message);
};

zk.ev.on('messages.upsert', async (msg) => {
    try {
        const { messages } = msg;
        const message = messages[0];

        if (!message.message) return; // Skip empty messages

        const from = message.key.remoteJid; // Chat ID
        const sender = message.key.participant || message.key.remoteJid; // Sender ID
        const isGroup = from.endsWith('@g.us'); // Check if the message is from a group

        if (!isGroup) return; // Skip non-group messages

        const groupMetadata = await zk.groupMetadata(from); // Fetch group metadata
        const groupAdmins = groupMetadata.participants
            .filter((member) => member.admin)
            .map((admin) => admin.id);

        if (conf.GCF === 'yes') {
            const messageType = Object.keys(message.message)[0];
            const body =
                messageType === 'conversation'
                    ? message.message.conversation
                    : message.message[messageType]?.text || '';

            if (!body) return; // Skip if there's no text

            // Skip messages from admins
            if (groupAdmins.includes(sender)) return;

            // Check for any link
            if (isAnyLink(body)) {
                // Send a notification to the group
                await zk.sendMessage(from, {
                    text: `🚫 Antilink detected 🚫\n\n@${sender.split('@')[0]} has been removed for sharing links.`,
                    mentions: [sender],
                });

                // Delete the message
                await zk.sendMessage(from, { delete: message.key });

                // Remove the sender from the group
                await zk.groupParticipantsUpdate(from, [sender], 'remove');
            }
        }
    } catch (err) {
        console.error('Error handling message:', err);
    }
});


      

        
       // Function to format notification message
function createNotification(deletedMessage) {
  const deletedBy = deletedMessage.key.participant || deletedMessage.key.remoteJid;
  return `*😈 ${conf.BOT} ANTIDELETE👿*\n\n` +
    `*Time deleted🥀:* ${new Date().toLocaleString()}\n` +
    `*Deleted by🌷:* @${deletedBy.split('@')[0]}\n\n*powered by ${conf.OWNER_NAME}*\n\n`;
}

// Helper function to download media based on message type
async function downloadMessageMedia(message) {
  if (message.imageMessage) return await downloadMedia(message.imageMessage);
  if (message.videoMessage) return await downloadMedia(message.videoMessage);
  if (message.documentMessage) return await downloadMedia(message.documentMessage);
  if (message.audioMessage) return await downloadMedia(message.audioMessage);
  if (message.stickerMessage) return await downloadMedia(message.stickerMessage);
  if (message.voiceMessage) return await downloadMedia(message.voiceMessage);
  return null;
}

// Event listener for all incoming messages
zk.ev.on("messages.upsert", async m => {
  // Check if ANTIDELETE is enabled
  if (conf.ADM !== "yes") return;

  const { messages } = m;
  const ms = messages[0];
  if (!ms.message) return;

  const messageKey = ms.key;
  const remoteJid = messageKey.remoteJid;

  // Store received messages for future undelete reference
  if (!store.chats[remoteJid]) {
    store.chats[remoteJid] = [];
  }
  store.chats[remoteJid].push(ms);

  // Handle deleted messages
  if (ms.message.protocolMessage && ms.message.protocolMessage.type === 0) {
    const deletedKey = ms.message.protocolMessage.key;

    // Search for the deleted message in the stored messages
    const chatMessages = store.chats[remoteJid];
    const deletedMessage = chatMessages.find(msg => msg.key.id === deletedKey.id);

    if (deletedMessage) {
      try {
        // Create notification about the deleted message
        const notification = createNotification(deletedMessage);

        // Handle text messages
        if (deletedMessage.message.conversation) {
          await zk.sendMessage(remoteJid, {
            text: `${notification}*Message:* ${deletedMessage.message.conversation}`,
            mentions: [deletedMessage.key.participant]
          });
        }
        
        // Handle media messages
        else {
          let mediaBuffer = null;
          let mediaType = '';

          // Check if the deleted message is an image
          if (deletedMessage.message.imageMessage) {
            mediaBuffer = await downloadMedia(deletedMessage.message.imageMessage);
            mediaType = 'image';
            const imageMessage = deletedMessage.message.imageMessage;

            await zk.sendMessage(remoteJid, {
              image: mediaBuffer,
              caption: notification,
              mentions: [deletedMessage.key.participant],
              url: imageMessage.url,
              viewOnce: imageMessage.viewOnce
            });
          }
          
          // Check if the deleted message is a video
          else if (deletedMessage.message.videoMessage) {
            mediaBuffer = await downloadMedia(deletedMessage.message.videoMessage);
            mediaType = 'video';
            const videoMessage = deletedMessage.message.videoMessage;

            await zk.sendMessage(remoteJid, {
              video: mediaBuffer,
              caption: notification,
              mentions: [deletedMessage.key.participant],
              url: videoMessage.url,
              viewOnce: videoMessage.viewOnce,
              gifPlayback: videoMessage.gifPlayback
            });
          }
          
          // Check if the deleted message is an audio
          else if (deletedMessage.message.audioMessage) {
            mediaBuffer = await downloadMedia(deletedMessage.message.audioMessage);
            mediaType = 'audio';
            const audioMessage = deletedMessage.message.audioMessage;
            const mimeType = audioMessage.mimetype;

            if (mimeType === 'audio/mp4' || mimeType === 'audio/mpeg' || audioMessage.ptt) {
              await zk.sendMessage(remoteJid, {
                audio: mediaBuffer,
                caption: notification,
                mentions: [deletedMessage.key.participant]
              });
            }
          }
          
          // Check if the deleted message is a document (audio/video)
          else if (deletedMessage.message.documentMessage) {
            const documentMessage = deletedMessage.message.documentMessage;
            const mimeType = documentMessage.mimetype;

            if (mimeType === 'audio/mp4' || mimeType === 'audio/mpeg') {
              mediaBuffer = await downloadMedia(documentMessage);
              mediaType = 'audio';
              await zk.sendMessage(remoteJid, {
                audio: mediaBuffer,
                caption: notification,
                mentions: [deletedMessage.key.participant]
              });
            }
            else if (mimeType === 'video/mp4') {
              mediaBuffer = await downloadMedia(documentMessage);
              mediaType = 'video';
              await zk.sendMessage(remoteJid, {
                video: mediaBuffer,
                caption: notification,
                mentions: [deletedMessage.key.participant]
              });
            }
          }
          
          // Check if the deleted message is a sticker
          else if (deletedMessage.message.stickerMessage) {
            const stickerMessage = deletedMessage.message.stickerMessage;
            mediaBuffer = await downloadMedia(stickerMessage);
            mediaType = 'sticker';

            await zk.sendMessage(remoteJid, {
              sticker: mediaBuffer,
              caption: notification,
              mentions: [deletedMessage.key.participant],
              pack: 'ALPHA-MD',
              author: conf.OWNER_NAME,
              type: StickerTypes.FULL,
              categories: ['🤩', '🎉'],
              id: '12345',
              quality: 50,
              background: '#000000'
            });
          }
          
          // Handle voice message (same handling as audio)
          else if (deletedMessage.message.voiceMessage) {
            const voiceMessage = deletedMessage.message.voiceMessage;
            mediaBuffer = await downloadMedia(voiceMessage);
            mediaType = 'audio';

            await zk.sendMessage(remoteJid, {
              audio: mediaBuffer,
              caption: notification,
              mentions: [deletedMessage.key.participant]
            });
          }
        }
      } catch (error) {
        console.error('Error handling deleted message:', error);
      }
    }
  }
});
 

        

        
let repliedContacts = new Set();

zk.ev.on("messages.upsert", async m => {
  const { messages } = m;
  const ms = messages[0];
  
  if (!ms.message) {
    return;
  }

  const messageText = ms.message.conversation || ms.message.extendedTextMessage?.text || "";
  const remoteJid = ms.key.remoteJid;

  // Get the sender's JID and number
  const senderJid = ms.key.participant || ms.key.remoteJid;
  const senderNumber = senderJid.split('@')[0];

  // Update the auto-reply message dynamically
  const auto_reply_message = `@${senderNumber}\n${conf.GREET_MSG}`;

  // Check if the message exists and is a command to set a new auto-reply message with any prefix
  if (messageText.match(/^[^\w\s]/) && ms.key.fromMe) {
    const prefix = messageText[0]; // Detect the prefix
    const command = messageText.slice(1).split(" ")[0]; // Command after prefix
    const newMessage = messageText.slice(prefix.length + command.length).trim(); // New message content

    if (command === "setautoreply" && newMessage) {
      conf.GREET_MSG = newMessage;
      await zk.sendMessage(remoteJid, {
        text: `Auto-reply message has been updated to:\n"${newMessage}"`
      });
      return;
    }
  }

  // Check if auto-reply is enabled, contact hasn't received a reply, and it's a private chat
  if (conf.GREET === "yes" && !repliedContacts.has(remoteJid) && !ms.key.fromMe && !remoteJid.includes("@g.us")) {
    await zk.sendMessage(remoteJid, {
      text: auto_reply_message,
      mentions: [senderJid]
    });

    // Add contact to replied set to prevent repeat replies
    repliedContacts.add(remoteJid);
  }
});

        
        
if (conf.AUTOBIO === 'yes') {
  setInterval(() => {
    const date = new Date();
    const formattedDate = date.toLocaleString('en-US', { timeZone: 'Africa/Nairobi' });
    const dayOfWeek = date.toLocaleString('en-US', { weekday: 'long', timeZone: 'Africa/Nairobi' });

    zk.updateProfileStatus(
      `${conf.BOT} is active 24/7\n\n${formattedDate} It's a ${dayOfWeek}.\n\n${conf.AUTOBIO_MSG}`
    );
  }, 10 * 1000);
}
        
const loveEmojis = ["❤️", "💖", "💘", "💝", "💓", "💌", "💕", "😎", "🔥", "💥", "💯", "✨", "🌟", "🌈", "⚡", "💎", "🌀", "👑", "🎉", "🎊", "🦄", "👽", "🛸", 
  "🚀", "🦋", "💫", "🍀", "🎶", "🎧", "🎸", "🎤", "🏆", "🏅", "🌍", "🌎", "🌏", "🎮", "🎲", "💪", 
  "🏋️", "🥇", "👟", "🏃", "🚴", "🚶", "🏄", "⛷️", "🕶️", "🧳", "🍿", "🍿", "🥂", "🍻", "🍷", "🍸", 
  "🥃", "🍾", "🎯", "⏳", "🎁", "🎈", "🎨", "🌻", "🌸", "🌺", "🌹", "🌼", "🌞", "🌝", "🌜", "🌙", 
  "🌚", "🍀", "🌱", "🍃", "🍂", "🌾", "🐉", "🐍", "🦓", "🦄", "🦋", "🦧", "🦘", "🦨", "🦡", "🐉", 
  "🐅", "🐆", "🐓", "🐢", "🐊", "🐠", "🐟", "🐡", "🦑", "🐙", "🦀", "🐬", "🦕", "🦖", "🐾", "🐕", 
  "🐈", "🐇", "🐾"];


let lastReactionTime = 0;

if (conf.AUTO_LIKE_STATUS === "yes") {
    console.log("AUTO_LIKE_STATUS is enabled. Listening for status updates...");

    zk.ev.on("messages.upsert", async (m) => {
        const { messages } = m;

        for (const message of messages) {
            // Check if the message is a status update
            if (message.key && message.key.remoteJid === "status@broadcast") {
                console.log("Detected status update from:", message.key.remoteJid);

                // Ensure throttling by checking the last reaction time
                const now = Date.now();
                if (now - lastReactionTime < 5000) {  // 5-second interval
                    console.log("Throttling reactions to prevent overflow.");
                    continue;
                }

                // Check if bot user ID is available
                const keith = zk.user && zk.user.id ? zk.user.id.split(":")[0] + "@s.whatsapp.net" : null;
                if (!keith) {
                    console.log("Bot's user ID not available. Skipping reaction.");
                    continue;
                }

                // Select a random love emoji
                const randomLoveEmoji = loveEmojis[Math.floor(Math.random() * loveEmojis.length)];

                // React to the status with the selected love emoji
                try {
                    await zk.sendMessage(message.key.remoteJid, {
                        react: {
                            key: message.key,
                            text: randomLoveEmoji, // Reaction emoji
                        },
                    }, {
                        statusJidList: [message.key.participant], // Add other participants if needed
                    });

                    // Log successful reaction and update the last reaction time
                    lastReactionTime = Date.now();
                    console.log(`Successfully reacted to status update by ${message.key.remoteJid} with ${randomLoveEmoji}`);

                    // Delay to avoid rapid reactions
                    await delay(2000); // 2-second delay between reactions
                } catch (error) {
                    console.error('Error reacting to status update:', error);
                }
            }
        }
    });
}

        
        






        zk.ev.on("messages.upsert", async (m) => {
            const { messages } = m;
            const ms = messages[0];
            if (!ms.message)
                return;
            const decodeJid = (jid) => {
                if (!jid)
                    return jid;
                if (/:\d+@/gi.test(jid)) {
                    let decode = (0, baileys_1.jidDecode)(jid) || {};
                    return decode.user && decode.server && decode.user + '@' + decode.server || jid;
                }
                else
                    return jid;
            };
            var mtype = (0, baileys_1.getContentType)(ms.message);
            var texte = mtype == "conversation" ? ms.message.conversation : mtype == "imageMessage" ? ms.message.imageMessage?.caption : mtype == "videoMessage" ? ms.message.videoMessage?.caption : mtype == "extendedTextMessage" ? ms.message?.extendedTextMessage?.text : mtype == "buttonsResponseMessage" ?
                ms?.message?.buttonsResponseMessage?.selectedButtonId : mtype == "listResponseMessage" ?
                ms.message?.listResponseMessage?.singleSelectReply?.selectedRowId : mtype == "messageContextInfo" ?
                (ms?.message?.buttonsResponseMessage?.selectedButtonId || ms.message?.listResponseMessage?.singleSelectReply?.selectedRowId || ms.text) : "";
            var origineMessage = ms.key.remoteJid;
            var idBot = decodeJid(zk.user.id);
            var servBot = idBot.split('@')[0];
            /* const keith='254748387615';
             const Keithkeizzah='254796299159';
             const Ghost='254110190196'*/
            /*  var superUser=[servBot,keith, Keithkeizzah,Ghost].map((s)=>s.replace(/[^0-9]/g)+"@s.whatsapp.net").includes(auteurMessage);
              var dev =[keith, Keithkeizzah,Ghost].map((t)=>t.replace(/[^0-9]/g)+"@s.whatsapp.net").includes(auteurMessage);*/
            const verifGroupe = origineMessage?.endsWith("@g.us");
            var infosGroupe = verifGroupe ? await zk.groupMetadata(origineMessage) : "";
            var nomGroupe = verifGroupe ? infosGroupe.subject : "";
            var msgRepondu = ms.message.extendedTextMessage?.contextInfo?.quotedMessage;
            var auteurMsgRepondu = decodeJid(ms.message?.extendedTextMessage?.contextInfo?.participant);
            //ms.message.extendedTextMessage?.contextInfo?.mentionedJid
            // ms.message.extendedTextMessage?.contextInfo?.quotedMessage.
            var mr = ms.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            var utilisateur = mr ? mr : msgRepondu ? auteurMsgRepondu : "";
            var auteurMessage = verifGroupe ? (ms.key.participant ? ms.key.participant : ms.participant) : origineMessage;
            if (ms.key.fromMe) {
                auteurMessage = idBot;
            }
            
            var membreGroupe = verifGroupe ? ms.key.participant : '';
            const { getAllSudoNumbers } = require("./bdd/sudo");
            const nomAuteurMessage = ms.pushName;
            const keith = '254748387615';
            const Keithkeizzah = '254796299159';
            const Ghost = "254110190196";
            const sudo = await getAllSudoNumbers();
            const superUserNumbers = [servBot, keith, Keithkeizzah, Ghost, conf.NUMERO_OWNER].map((s) => s.replace(/[^0-9]/g) + "@s.whatsapp.net");
            const allAllowedNumbers = superUserNumbers.concat(sudo);
            const superUser = allAllowedNumbers.includes(auteurMessage);
            
            var dev = [keith, Keithkeizzah,Ghost].map((t) => t.replace(/[^0-9]/g) + "@s.whatsapp.net").includes(auteurMessage);
            function repondre(mes) { zk.sendMessage(origineMessage, { text: mes }, { quoted: ms }); }
            console.log("\t [][]...{ALPHA-MD}...[][]");
            console.log("=========== New message ===========");
            if (verifGroupe) {
                console.log("message from the group : " + nomGroupe);
            }
            console.log("message sent By : " + "[" + nomAuteurMessage + " : " + auteurMessage.split("@s.whatsapp.net")[0] + " ]");
            console.log("message type : " + mtype);
            console.log("------ message content ------");
            console.log(texte);
            /**  */
            function groupeAdmin(membreGroupe) {
                let admin = [];
                for (m of membreGroupe) {
                    if (m.admin == null)
                        continue;
                    admin.push(m.id);
                }
                // else{admin= false;}
                return admin;
            }

            var etat =conf.ETAT;
            if(etat==1)
            {await zk.sendPresenceUpdate("available",origineMessage);}
            else if(etat==2)
            {await zk.sendPresenceUpdate("composing",origineMessage);}
            else if(etat==4)
            {await zk.sendPresenceUpate("sleeping ",origineMessage);}
            else if(etat==5)
            {await zk.sendPresenceUpate("lying ",origineMessage);}
            else if(etat==6)
            {await zk.sendPresenceUpate("fighting ",origineMessage);}
            else if(etat==7)
            {await zk.sendPresenceUpate("hacking ",origineMessage);}
            else if(etat==8)
            {await zk.sendPresenceUpate("laughing ",origineMessage);}
            else if(etat==3)
            {
            await zk.sendPresenceUpdate("recording",origineMessage);
            }
            else
            {
                await zk.sendPresenceUpdate("unavailable",origineMessage);
            }

            const mbre = verifGroupe ? await infosGroupe.participants : '';
            //  const verifAdmin = verifGroupe ? await mbre.filter(v => v.admin !== null).map(v => v.id) : ''
            let admins = verifGroupe ? groupeAdmin(mbre) : '';
            const verifAdmin = verifGroupe ? admins.includes(auteurMessage) : false;
            var verifZokouAdmin = verifGroupe ? admins.includes(idBot) : false;
            /** ** */
            /** ***** */
            const arg = texte ? texte.trim().split(/ +/).slice(1) : null;
            const verifCom = texte ? texte.startsWith(prefixe) : false;
            const com = verifCom ? texte.slice(1).trim().split(/ +/).shift().toLowerCase() : false;
           
         
            const lien = conf.URL.split(',')  

            
            // Utiliser une boucle for...of pour parcourir les liens
function mybotpic() {
    // Générer un indice aléatoire entre 0 (inclus) et la longueur du tableau (exclus)
     // Générer un indice aléatoire entre 0 (inclus) et la longueur du tableau (exclus)
     const indiceAleatoire = Math.floor(Math.random() * lien.length);
     // Récupérer le lien correspondant à l'indice aléatoire
     const lienAleatoire = lien[indiceAleatoire];
     return lienAleatoire;
  }
            

            var commandeOptions = {
                superUser, 
                dev,
                verifGroupe,
                mbre,
                membreGroupe,
                verifAdmin,
                infosGroupe,
                nomGroupe,
                auteurMessage,
                nomAuteurMessage,
                idBot,
                verifZokouAdmin,
                prefixe,
                arg,
                repondre,
                mtype,
                groupeAdmin,
                msgRepondu,
                auteurMsgRepondu,
                ms,
                mybotpic
            
            };
            
             if (!superUser && origineMessage === auteurMessage && conf.AUTO_REACT === 'yes') {
    const emojis = ['❤', '💕', '😻', '🧡', '💛', '💚', '💙', '💜', '🖤', '❣', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥', '💌', '🙂', '🤗', '😌', '😉', '😊', '🎊', '🎉', '🎁', '🎈', '👋'];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    zk.sendMessage(origineMessage, {
        'react': {
            'text': randomEmoji,
            'key': ms.key
        }
    });
}
              if (conf.AUTO_READ_MESSAGES === "yes") {
        zk.ev.on("messages.upsert", async m => {
          const {
            messages
          } = m;
          for (const message of messages) {
            if (!message.key.fromMe) {
              await zk.readMessages([message.key]);
            }
          }
        });
      }
            const urlPattern = /https?:\/\/[^\s]+/; // Simple regex to detect links

if (urlPattern.test(texte) && !verifAdmin && origineMessage === auteurMessage && verifGroupe && conf.GCF === 'yes') {
  console.log(`Link detected in message: ${texte}`);

  try {
    // Notify the user about posting prohibited links
    await zk.sendMessage(auteurMessage, {
      text: "@${auteurMessage.split('@')[0]} Sending links here is prohibited🚫!"
    });

    // Delete the message that contains the link
    await zk.deleteMessage(texte);
    console.log(`Message from ${auteurMessage} deleted successfully.`);
  } catch (error) {
    console.error(`Error deleting message from ${auteurMessage}:`, error);
  }
} else {
  if (!urlPattern.test(texte)) {
    console.log('No links detected.');
  }
  if (verifAdmin) {
    console.log('Sender is an admin, no action taken.');
  }
  if (origineMessage !== auteurMessage) {
    console.log('Origin message is not from the author, no action taken.');
  }
  if (conf.GCF !== 'yes') {
    console.log('Auto-action is not enabled.');
  }
}

            
// Track the last text time to prevent overflow

/*let lastTextTime = 0;
const messageDelay = 5000; // Set the minimum delay between messages (in milliseconds)

if (origineMessage !== auteurMessage && conf.CHATBOT === 'yes') {
  try {
    const currentTime = Date.now();
    if (currentTime - lastTextTime < messageDelay) {
      console.log('Message skipped: Too many messages in a short time.');
      return;
    }

    // Fetch chatbot response using axios
    const response = await axios.get('https://api.davidcyriltech.my.id/ai/gpt4', {
      params: {
        text: texte
      }
    });

    const keith = response.data;

    if (keith && keith.success && keith.message) {
      await zk.sendMessage(origineMessage, {
        text: keith.message
      });
      lastTextTime = Date.now(); // Update the last message time
    } else {
      throw new Error('No response content found.');
    }
  } catch (error) {
    console.error('Error fetching chatbot response:', error);
  }
}*/
            if (!superUser && origineMessage === auteurMessage && conf.CHATBOT_INBOX === 'yes') {
  try {
    const currentTime = Date.now();
    if (currentTime - lastTextTime < messageDelay) {
      console.log('Message skipped: Too many messages in a short time.');
      return;
    }

    // Fetch chatbot response using axios
    const response = await axios.get('https://bk9.fun/ai/blackbox', {
      params: {
        q: texte
      }
    });

    const keith = response.data;

    if (keith && keith.status && keith.BK9) {
      await zk.sendMessage(origineMessage, {
        text: keith.BK9
      });
      lastTextTime = Date.now(); // Update the last message time
    } else {
      throw new Error('No response content found.');
    }
  } catch (error) {
    console.error('Error fetching chatbot response:', error);
  }
}
            



            if (! superUser && origineMessage == auteurMessage && conf.VOICE_CHATBOT_INBOX === 'yes') {
  try {
    const currentTime = Date.now();
    if (currentTime - lastTextTime < messageDelay) {
      console.log('Message skipped: Too many messages in a short time.');
      return;
    }

    const response = await axios.get('https://api.davidcyriltech.my.id/ai/gpt4', {
      params: {
        text: texte
      }
    });

    const keith = response.data;

    if (keith && keith.success && keith.message) {
      // Generate audio URL for the response message
      const audioUrl = googleTTS.getAudioUrl(keith.message, {
        lang: 'en', // You can modify this to support any language dynamically
        slow: false,
        host: 'https://translate.google.com'
      });

      // Send audio message response with PTT (push-to-talk) enabled
      await zk.sendMessage(origineMessage, { audio: { url: audioUrl }, mimetype: 'audio/mp4', ptt: true });
      
      lastTextTime = Date.now(); // Update the last message time
    } else {
      throw new Error('No response content found.');
    }
  } catch (error) {
    console.error('Error fetching chatbot response:', error);
  }
}

            



/*if (origineMessage !== auteurMessage && conf.VOICE_CHATBOT === 'yes') {
  try {
    const currentTime = Date.now();
    if (currentTime - lastTextTime < messageDelay) {
      console.log('Message skipped: Too many messages in a short time.');
      return;
    }

    const response = await axios.get('https://api.davidcyriltech.my.id/ai/gpt4', {
      params: {
        text: texte
      }
    });

    const keith = response.data;

    if (keith && keith.success && keith.message) {
      // Generate audio URL for the response message
      const audioUrl = googleTTS.getAudioUrl(keith.message, {
        lang: 'en', // You can modify this to support any language dynamically
        slow: false,
        host: 'https://translate.google.com'
      });

      // Send audio message response with PTT (push-to-talk) enabled
      await zk.sendMessage(origineMessage, { audio: { url: audioUrl }, mimetype: 'audio/mp4', ptt: true });
      
      lastTextTime = Date.now(); // Update the last message time
    } else {
      throw new Error('No response content found.');
    }
  } catch (error) {
    console.error('Error fetching chatbot response:', error);
  }
}*/
            

const badWords = ['stupid', 'idiot', 'fool', 'dumb', 'jerk']; // Add more bad words as needed

if (badWords.some(word => texte.includes(word)) && !superUser && origineMessage === auteurMessage && conf.AUTO_BLOCK === 'yes') {
  console.log(`Bad word detected in message: ${texte}`);

  try {
    await zk.sendMessage(auteurMessage, {
      text: "🚫 I am blocking you because you have violated Keith policies 🚫!"
    });
    await zk.updateBlockStatus(auteurMessage, 'block');
    console.log(`User ${auteurMessage} blocked successfully.`);
  } catch (error) {
    console.error(`Error blocking user ${auteurMessage}:`, error);
  }
} else {
  if (!badWords.some(word => texte.includes(word))) {
    console.log('No bad words detected.');
  }
  if (superUser) {
    console.log('Sender is a super user, not blocking.');
  }
  if (origineMessage !== auteurMessage) {
    console.log('Origin message is not from the author, not blocking.');
  }
  if (conf.AUTO_BLOCK !== 'yes') {
    console.log('Auto-block is not enabled.');
  }
}
            if (ms.key && ms.key.remoteJid === 'status@broadcast' && conf.AUTO_STATUS_REPLY === "yes") {
  const user = ms.key.participant;
  const text = `${conf.AUTO_STATUS_MSG}`;
  
  await zk.sendMessage(user, { 
    text: text,
    react: { text: '⚔️', key: ms.key }
  }, { quoted: ms });
            }
            
              if (ms.key && ms.key.remoteJid === "status@broadcast" && conf.AUTO_READ_STATUS === "yes") {
                await zk.readMessages([ms.key]);
            }
            
            
if (ms.key && ms.key.remoteJid === 'status@broadcast' && conf.AUTO_DOWNLOAD_STATUS === "yes") {
    /* await zk.readMessages([ms.key]);*/
    if (ms.message.extendedTextMessage) {
        const stTxt = ms.message.extendedTextMessage.text;
        await zk.sendMessage(idBot, { text: stTxt }, { quoted: ms });
    } else if (ms.message.imageMessage) {
        const stMsg = ms.message.imageMessage.caption;
        const stImg = await zk.downloadAndSaveMediaMessage(ms.message.imageMessage);
        await zk.sendMessage(idBot, { image: { url: stImg }, caption: stMsg }, { quoted: ms });
    } else if (ms.message.videoMessage) {
        const stMsg = ms.message.videoMessage.caption;
        const stVideo = await zk.downloadAndSaveMediaMessage(ms.message.videoMessage);
        await zk.sendMessage(idBot, {
            video: { url: stVideo }, caption: stMsg
        }, { quoted: ms });
    }
}







        
            
 //---------------------------------------rang-count--------------------------------
             if (texte && auteurMessage.endsWith("s.whatsapp.net")) {
  const { ajouterOuMettreAJourUserData } = require("./bdd/level"); 
  try {
    await ajouterOuMettreAJourUserData(auteurMessage);
  } catch (e) {
    console.error(e);
  }
              }
            
                /////////////////////////////   Mentions /////////////////////////////////////////
         
              try {
        
                if (ms.message[mtype].contextInfo.mentionedJid && (ms.message[mtype].contextInfo.mentionedJid.includes(idBot) ||  ms.message[mtype].contextInfo.mentionedJid.includes(conf.NUMERO_OWNER + '@s.whatsapp.net'))    /*texte.includes(idBot.split('@')[0]) || texte.includes(conf.NUMERO_OWNER)*/) {
            
                    if (origineMessage == "120363158701337904@g.us") {
                        return;
                    } ;
            
                    if(superUser) {console.log('hummm') ; return ;} 
                    
                    let mbd = require('./bdd/mention') ;
            
                    let alldata = await mbd.recupererToutesLesValeurs() ;
            
                        let data = alldata[0] ;
            
                    if ( data.status === 'non') { console.log('mention pas actifs') ; return ;}
            
                    let msg ;
            
                    if (data.type.toLocaleLowerCase() === 'image') {
            
                        msg = {
                                image : { url : data.url},
                                caption : data.message
                        }
                    } else if (data.type.toLocaleLowerCase() === 'video' ) {
            
                            msg = {
                                    video : {   url : data.url},
                                    caption : data.message
                            }
            
                    } else if (data.type.toLocaleLowerCase() === 'sticker') {
            
                        let stickerMess = new Sticker(data.url, {
                            pack: conf.NOM_OWNER,
                            type: StickerTypes.FULL,
                            categories: ["🤩", "🎉"],
                            id: "12345",
                            quality: 70,
                            background: "transparent",
                          });
            
                          const stickerBuffer2 = await stickerMess.toBuffer();
            
                          msg = {
                                sticker : stickerBuffer2 
                          }
            
                    }  else if (data.type.toLocaleLowerCase() === 'audio' ) {
            
                            msg = {
            
                                audio : { url : data.url } ,
                                mimetype:'audio/mp4',
                                 }
                        
                    }
            
                    zk.sendMessage(origineMessage,msg,{quoted : ms})
            
                }
            } catch (error) {
                
            } 


     //anti-lien
     try {
        const yes = await verifierEtatJid(origineMessage)
        if (texte.includes('https://') && verifGroupe &&  yes  ) {

         console.log("lien detecté")
            var verifZokAdmin = verifGroupe ? admins.includes(idBot) : false;
            
             if(superUser || verifAdmin || !verifZokAdmin  ) { console.log('je fais rien'); return};
                        
                                    const key = {
                                        remoteJid: origineMessage,
                                        fromMe: false,
                                        id: ms.key.id,
                                        participant: auteurMessage
                                    };
                                    var txt = "link detected, \n";
                                   // txt += `message supprimé \n @${auteurMessage.split("@")[0]} rétiré du groupe.`;
                                    const gifLink = "https://raw.githubusercontent.com/djalega8000/Zokou-MD/main/media/remover.gif";
                                    var sticker = new Sticker(gifLink, {
                                        pack: conf.BOT,
                                        author: conf.OWNER_NAME,
                                        type: StickerTypes.FULL,
                                        categories: ['🤩', '🎉'],
                                        id: '12345',
                                        quality: 50,
                                        background: '#000000'
                                    });
                                    await sticker.toFile("st1.webp");
                                    // var txt = `@${auteurMsgRepondu.split("@")[0]} a été rétiré du groupe..\n`
                                    var action = await recupererActionJid(origineMessage);

                                      if (action === 'remove') {

                                        txt += `message deleted \n @${auteurMessage.split("@")[0]} removed from group.`;

                                    await zk.sendMessage(origineMessage, { sticker: fs.readFileSync("st1.webp") });
                                    (0, baileys_1.delay)(800);
                                    await zk.sendMessage(origineMessage, { text: txt, mentions: [auteurMessage] }, { quoted: ms });
                                    try {
                                        await zk.groupParticipantsUpdate(origineMessage, [auteurMessage], "remove");
                                    }
                                    catch (e) {
                                        console.log("antiien ") + e;
                                    }
                                    await zk.sendMessage(origineMessage, { delete: key });
                                    await fs.unlink("st1.webp"); } 
                                        
                                       else if (action === 'delete') {
                                        txt += `Goodbye \n @${auteurMessage.split("@")[0]} Sending other group links here is prohibited!.`;
                                        // await zk.sendMessage(origineMessage, { sticker: fs.readFileSync("st1.webp") }, { quoted: ms });
                                       await zk.sendMessage(origineMessage, { text: txt, mentions: [auteurMessage] }, { quoted: ms });
                                       await zk.sendMessage(origineMessage, { delete: key });
                                       await fs.unlink("st1.webp");

                                    } else if(action === 'warn') {
                                        const {getWarnCountByJID ,ajouterUtilisateurAvecWarnCount} = require('./bdd/warn') ;

                            let warn = await getWarnCountByJID(auteurMessage) ; 
                            let warnlimit = conf.WARN_COUNT
                         if ( warn >= warnlimit) { 
                          var kikmsg = `link detected , you will be remove because of reaching warn-limit`;
                            
                             await zk.sendMessage(origineMessage, { text: kikmsg , mentions: [auteurMessage] }, { quoted: ms }) ;


                             await zk.groupParticipantsUpdate(origineMessage, [auteurMessage], "remove");
                             await zk.sendMessage(origineMessage, { delete: key });


                            } else {
                                var rest = warnlimit - warn ;
                              var  msg = `Link detected , your warn_count was upgrade ;\n rest : ${rest} `;

                              await ajouterUtilisateurAvecWarnCount(auteurMessage)

                              await zk.sendMessage(origineMessage, { text: msg , mentions: [auteurMessage] }, { quoted: ms }) ;
                              await zk.sendMessage(origineMessage, { delete: key });

                            }
                                    }
                                }
                                
                            }
                        
                    
                
            
        
    
    catch (e) {
        console.log("bdd err " + e);
    }
    


    /** *************************anti-bot******************************************** */
    try {
        const botMsg = ms.key?.id?.startsWith('BAES') && ms.key?.id?.length === 16;
        const baileysMsg = ms.key?.id?.startsWith('BAE5') && ms.key?.id?.length === 16;
        if (botMsg || baileysMsg) {

            if (mtype === 'reactionMessage') { console.log('Je ne reagis pas au reactions') ; return} ;
            const antibotactiver = await atbverifierEtatJid(origineMessage);
            if(!antibotactiver) {return};

            if( verifAdmin || auteurMessage === idBot  ) { console.log('je fais rien'); return};
                        
            const key = {
                remoteJid: origineMessage,
                fromMe: false,
                id: ms.key.id,
                participant: auteurMessage
            };
            var txt = "bot detected, \n";
           // txt += `message supprimé \n @${auteurMessage.split("@")[0]} rétiré du groupe.`;
            const gifLink = "https://raw.githubusercontent.com/djalega8000/Zokou-MD/main/media/remover.gif";
            var sticker = new Sticker(gifLink, {
                pack: 'ALPHA-MD',
                author: conf.OWNER_NAME,
                type: StickerTypes.FULL,
                categories: ['🤩', '🎉'],
                id: '12345',
                quality: 50,
                background: '#000000'
            });
            await sticker.toFile("st1.webp");
            // var txt = `@${auteurMsgRepondu.split("@")[0]} a été rétiré du groupe..\n`
            var action = await atbrecupererActionJid(origineMessage);

              if (action === 'remove') {

                txt += `message deleted \n @${auteurMessage.split("@")[0]} removed from group.`;

            await zk.sendMessage(origineMessage, { sticker: fs.readFileSync("st1.webp") });
            (0, baileys_1.delay)(800);
            await zk.sendMessage(origineMessage, { text: txt, mentions: [auteurMessage] }, { quoted: ms });
            try {
                await zk.groupParticipantsUpdate(origineMessage, [auteurMessage], "remove");
            }
            catch (e) {
                console.log("antibot ") + e;
            }
            await zk.sendMessage(origineMessage, { delete: key });
            await fs.unlink("st1.webp"); } 
                
               else if (action === 'delete') {
                txt += `message delete \n @${auteurMessage.split("@")[0]} Avoid sending link.`;
                //await zk.sendMessage(origineMessage, { sticker: fs.readFileSync("st1.webp") }, { quoted: ms });
               await zk.sendMessage(origineMessage, { text: txt, mentions: [auteurMessage] }, { quoted: ms });
               await zk.sendMessage(origineMessage, { delete: key });
               await fs.unlink("st1.webp");

            } else if(action === 'warn') {
                const {getWarnCountByJID ,ajouterUtilisateurAvecWarnCount} = require('./bdd/warn') ;

    let warn = await getWarnCountByJID(auteurMessage) ; 
    let warnlimit = conf.WARN_COUNT
 if ( warn >= warnlimit) { 
  var kikmsg = `bot detected ;you will be remove because of reaching warn-limit`;
    
     await zk.sendMessage(origineMessage, { text: kikmsg , mentions: [auteurMessage] }, { quoted: ms }) ;


     await zk.groupParticipantsUpdate(origineMessage, [auteurMessage], "remove");
     await zk.sendMessage(origineMessage, { delete: key });


    } else {
        var rest = warnlimit - warn ;
      var  msg = `bot detected , your warn_count was upgrade ;\n rest : ${rest} `;

      await ajouterUtilisateurAvecWarnCount(auteurMessage)

      await zk.sendMessage(origineMessage, { text: msg , mentions: [auteurMessage] }, { quoted: ms }) ;
      await zk.sendMessage(origineMessage, { delete: key });

    }
                }
        }
    }
    catch (er) {
        console.log('.... ' + er);
    }        
             
         
            /////////////////////////
            
            //execution des commandes   
             if (verifCom) {
        const cd = evt.cm.find(keith => keith.nomCom === com || keith.nomCom === com || keith.aliases && keith.aliases.includes(com));
        if (cd) {
          try {
            if (conf.MODE.toLocaleLowerCase() != 'yes' && !superUser) {
              return;
            }

                         /******************* PM_PERMT***************/

            if (!superUser && origineMessage === auteurMessage&& conf.PM_PERMIT === "yes" ) {
                repondre("You don't have acces to commands here") ; return }
            ///////////////////////////////

             
            /*****************************banGroup  */
            if (!superUser && verifGroupe) {

                 let req = await isGroupBanned(origineMessage);
                    
                        if (req) { return }
            }

              /***************************  ONLY-ADMIN  */

            if(!verifAdmin && verifGroupe) {
                 let req = await isGroupOnlyAdmin(origineMessage);
                    
                        if (req) {  return }}

              /**********************banuser */
         
            
                if(!superUser) {
                    let req = await isUserBanned(auteurMessage);
                    
                        if (req) {repondre("You are banned from bot commands"); return}
                    

                } 

                        reagir(origineMessage, zk, ms, cd.reaction);
                        cd.fonction(origineMessage, zk, commandeOptions);
                    }
                    catch (e) {
                        console.log("😡😡 " + e);
                        zk.sendMessage(origineMessage, { text: "😡😡 " + e }, { quoted: ms });
                    }
                }
            }
            //fin exécution commandes
        });
        //fin événement message

/******** evenement groupe update ****************/
const { recupevents } = require('./bdd/welcome'); 

zk.ev.on('group-participants.update', async (group) => {
    console.log(group);

    let ppgroup;
    try {
        ppgroup = await zk.profilePictureUrl(group.id, 'image');
    } catch {
        ppgroup = 'https://telegra.ph/file/c66d12099fb7a4f62d70a.jpg';
    }

    try {
        const metadata = await zk.groupMetadata(group.id);

        if (group.action == 'add' && (await recupevents(group.id, "welcome") == 'on')) {
            let msg = `╭═══◇KEITH-TECH◇═══⊷
`;
             
            let membres = group.participants;
            for (let membre of membres) {
                msg += `║ Hello @${membre.split("@")[0]}\n`;
            }

            msg += `║ *You are welcomed here* _You MAY read the group description FOR more info and Avoid getting removed_
            
     
 ╰═══◇◇═══⊷
            
 ◇ *GROUP DESCRIPTION*  ◇

${metadata.desc}`;

            zk.sendMessage(group.id, { image: { url: ppgroup }, caption: msg, mentions: membres });
        } else if (group.action == 'remove' && (await recupevents(group.id, "goodbye") == 'on')) {
            let msg = `Goodbye to that Fallen soldier, Powered by*;\n`;

            let membres = group.participants;
            for (let membre of membres) {
                msg += `@${membre.split("@")[0]}\n`;
            }

            zk.sendMessage(group.id, { text: msg, mentions: membres });

        } else if (group.action == 'promote' && (await recupevents(group.id, "antipromote") == 'on') ) {
            //  console.log(zk.user.id)
          if (group.author == metadata.owner || group.author  == conf.NUMERO_OWNER + '@s.whatsapp.net' || group.author == decodeJid(zk.user.id)  || group.author == group.participants[0]) { console.log('Cas de superUser je fais rien') ;return ;} ;


         await   zk.groupParticipantsUpdate(group.id ,[group.author,group.participants[0]],"demote") ;

         zk.sendMessage(
              group.id,
              {
                text : `@${(group.author).split("@")[0]} has violated the anti-promotion rule, therefore both ${group.author.split("@")[0]} and @${(group.participants[0]).split("@")[0]} have been removed from administrative rights.`,
                mentions : [group.author,group.participants[0]]
              }
         )

        } else if (group.action == 'demote' && (await recupevents(group.id, "antidemote") == 'on') ) {

            if (group.author == metadata.owner || group.author ==  conf.NUMERO_OWNER + '@s.whatsapp.net' || group.author == decodeJid(zk.user.id) || group.author == group.participants[0]) { console.log('Cas de superUser je fais rien') ;return ;} ;


           await  zk.groupParticipantsUpdate(group.id ,[group.author],"demote") ;
           await zk.groupParticipantsUpdate(group.id , [group.participants[0]] , "promote")

           zk.sendMessage(
                group.id,
                {
                  text : `@${(group.author).split("@")[0]} has violated the anti-demotion rule by removing @${(group.participants[0]).split("@")[0]}. Consequently, he has been stripped of administrative rights.` ,
                  mentions : [group.author,group.participants[0]]
                }
           )

     } 

    } catch (e) {
        console.error(e);
    }
});

/******** fin d'evenement groupe update *************************/



    /*****************************Cron setup */

        
    async  function activateCrons() {
        const cron = require('node-cron');
        const { getCron } = require('./bdd/cron');

          let crons = await getCron();
          console.log(crons);
          if (crons.length > 0) {
        
            for (let i = 0; i < crons.length; i++) {
        
              if (crons[i].mute_at != null) {
                let set = crons[i].mute_at.split(':');

                console.log(`etablissement d'un automute pour ${crons[i].group_id} a ${set[0]} H ${set[1]}`)

                cron.schedule(`${set[1]} ${set[0]} * * *`, async () => {
                  await zk.groupSettingUpdate(crons[i].group_id, 'announcement');
                  zk.sendMessage(crons[i].group_id, { image : { url : './media/chrono.webp'} , caption: "Hello, it's time to close the group; sayonara." });

                }, {
                    timezone: "Bungoma,Kenya"
                  });
              }
        
              if (crons[i].unmute_at != null) {
                let set = crons[i].unmute_at.split(':');

                console.log(`etablissement d'un autounmute pour ${set[0]} H ${set[1]} `)
        
                cron.schedule(`${set[1]} ${set[0]} * * *`, async () => {

                  await zk.groupSettingUpdate(crons[i].group_id, 'not_announcement');

                  zk.sendMessage(crons[i].group_id, { image : { url : './media/chrono.webp'} , caption: "Good morning; It's time to open the group." });

                 
                },{
                    timezone: "Bungoma,Kenya"
                  });
              }
        
            }
          } else {
            console.log('Les crons n\'ont pas été activés');
          }

          return
        }

        
        //événement contact
        zk.ev.on("contacts.upsert", async (contacts) => {
            const insertContact = (newContact) => {
                for (const contact of newContact) {
                    if (store.contacts[contact.id]) {
                        Object.assign(store.contacts[contact.id], contact);
                    }
                    else {
                        store.contacts[contact.id] = contact;
                    }
                }
                return;
            };
            insertContact(contacts);
        });
        //fin événement contact 
        //événement connexion
        zk.ev.on("connection.update", async (con) => {
            const { lastDisconnect, connection } = con;
            if (connection === "connecting") {
                console.log("ℹ️ Alpha is connecting to your account...");
            }
            else if (connection === 'open') {
                await zk.groupAcceptInvite("KOvNtZbE3JC32oGAe6BQpp");

                console.log("✅ connected successfully enjoy☺️");
                console.log("--");
                await (0, baileys_1.delay)(200);
                console.log("------");
                await (0, baileys_1.delay)(300);
                console.log("------------------/-----");
                console.log("le bot est en ligne 🕸\n\n");
                //chargement des commands 
                console.log("chargement des commands ...\n");
                fs.readdirSync(__dirname + "/commands").forEach((fichier) => {
                    if (path.extname(fichier).toLowerCase() == (".js")) {
                        try {
                            require(__dirname + "/commands/" + fichier);
                            console.log(fichier + " installé ✔️");
                        }
                        catch (e) {
                            console.log(`${fichier} n'a pas pu être chargé pour les raisons suivantes : ${e}`);
                        } /* require(__dirname + "/commands/" + fichier);
                         console.log(fichier + " installé ✔️")*/
                        (0, baileys_1.delay)(300);
                    }
                });
                (0, baileys_1.delay)(700);
                var md;
                if ((conf.MODE).toLocaleLowerCase() === "yes") {
                    md = "public";
                }
                else if ((conf.MODE).toLocaleLowerCase() === "no") {
                    md = "private";
                }
                else {
                    md = "undefined";
                }
                console.log("chargement des commandes terminé ✅");

                await activateCrons();
                const date = new Date();
                const formattedDate = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: conf.TIMEZONE });
                const formattedTime = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric', timeZone: conf.TIMEZONE });
                const getGreeting = () => {
        const currentHour = DateTime.now().setZone(conf.TIMEZONE).hour;

        if (currentHour >= 5 && currentHour < 12) {
          return 'Good morning fam';
        } else if (currentHour >= 12 && currentHour < 18) {
          return 'Good afternoon ☀️';
        } else if (currentHour >= 18 && currentHour < 22) {
          return 'Good evening gee';
        } else {
              return 'Good night mzee';
            }
        };


        const getCurrentTimeInNairobi = () => {
            return DateTime.now().setZone(conf.TIMEZONE).toLocaleString(DateTime.TIME_SIMPLE);
        };
                
                if((conf.DP).toLowerCase() === 'yes') {     
                let cmsg = `Hello👋  *${conf.OWNER_NAME}*  😎 ,
                 *${getGreeting()},*
                 *It's ${formattedDate} 🗓️*
                 *the time is ${formattedTime}.🕛*      
 ╭════⊷         
║ *『 ${conf.BOT} 𝐢𝐬 𝐎𝐧𝐥𝐢𝐧𝐞』*
║    Prefix : [ ${prefixe} ]
║    Mode :${md}
║    Total Commands : ${evt.cm.length}︎
╰═════════════════⊷

╭───◇
┃ 
┃
┃ *Thank you for choosing*                      
┃  *${conf.BOT}*
┃
╰═════════════════⊷`;
                await zk.sendMessage(zk.user.id, {
  text: cmsg,
  disappearingMessagesInChat: true,
  ephemeralExpiration: 5
});
                }
            }
            else if (connection == "close") {
                let raisonDeconnexion = new boom_1.Boom(lastDisconnect?.error)?.output.statusCode;
                if (raisonDeconnexion === baileys_1.DisconnectReason.badSession) {
                    console.log('Session id érronée veuillez rescanner le qr svp ...');
                }
                else if (raisonDeconnexion === baileys_1.DisconnectReason.connectionClosed) {
                    console.log('!!! connexion fermée, reconnexion en cours ...');
                    main();
                }
                else if (raisonDeconnexion === baileys_1.DisconnectReason.connectionLost) {
                    console.log('connexion au serveur perdue 😞 ,,, reconnexion en cours ... ');
                    main();
                }
                else if (raisonDeconnexion === baileys_1.DisconnectReason?.connectionReplaced) {
                    console.log('connexion réplacée ,,, une sesssion est déjà ouverte veuillez la fermer svp !!!');
                }
                else if (raisonDeconnexion === baileys_1.DisconnectReason.loggedOut) {
                    console.log('vous êtes déconnecté,,, veuillez rescanner le code qr svp');
                }
                else if (raisonDeconnexion === baileys_1.DisconnectReason.restartRequired) {
                    console.log('redémarrage en cours ▶️');
                    main();
                }   else {

                    console.log('redemarrage sur le coup de l\'erreur  ',raisonDeconnexion) ;         
                    //repondre("* Redémarrage du bot en cour ...*");

                                const {exec}=require("child_process") ;

                                exec("pm2 restart all");            
                }
                // sleep(50000)
                console.log("hum " + connection);
                main(); //console.log(session)
            }
        });
        //fin événement connexion
        //événement authentification 
        zk.ev.on("creds.update", saveCreds);
        //fin événement authentification 
        //
        /** ************* */
        //fonctions utiles
        zk.downloadAndSaveMediaMessage = async (message, filename = '', attachExtension = true) => {
            let quoted = message.msg ? message.msg : message;
            let mime = (message.msg || message).mimetype || '';
            let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
            const stream = await (0, baileys_1.downloadContentFromMessage)(quoted, messageType);
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            let type = await FileType.fromBuffer(buffer);
            let trueFileName = './' + filename + '.' + type.ext;
            // save to file
            await fs.writeFileSync(trueFileName, buffer);
            return trueFileName;
        };


        zk.awaitForMessage = async (options = {}) =>{
            return new Promise((resolve, reject) => {
                if (typeof options !== 'object') reject(new Error('Options must be an object'));
                if (typeof options.sender !== 'string') reject(new Error('Sender must be a string'));
                if (typeof options.chatJid !== 'string') reject(new Error('ChatJid must be a string'));
                if (options.timeout && typeof options.timeout !== 'number') reject(new Error('Timeout must be a number'));
                if (options.filter && typeof options.filter !== 'function') reject(new Error('Filter must be a function'));
        
                const timeout = options?.timeout || undefined;
                const filter = options?.filter || (() => true);
                let interval = undefined
        
                /**
                 * 
                 * @param {{messages: Baileys.proto.IWebMessageInfo[], type: Baileys.MessageUpsertType}} data 
                 */
                let listener = (data) => {
                    let { type, messages } = data;
                    if (type == "notify") {
                        for (let message of messages) {
                            const fromMe = message.key.fromMe;
                            const chatId = message.key.remoteJid;
                            const isGroup = chatId.endsWith('@g.us');
                            const isStatus = chatId == 'status@broadcast';
        
                            const sender = fromMe ? zk.user.id.replace(/:.*@/g, '@') : (isGroup || isStatus) ? message.key.participant.replace(/:.*@/g, '@') : chatId;
                            if (sender == options.sender && chatId == options.chatJid && filter(message)) {
                                zk.ev.off('messages.upsert', listener);
                                clearTimeout(interval);
                                resolve(message);
                            }
                        }
                    }
                }
                app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'keizzah', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

                zk.ev.on('messages.upsert', listener);
                if (timeout) {
                    interval = setTimeout(() => {
                        zk.ev.off('messages.upsert', listener);
                        reject(new Error('Timeout'));
                    }, timeout);
                }
            });
        }



        // fin g utiles
        /** ************* */
        return zk;
    }
    let fichier = require.resolve(__filename);
    fs.watchFile(fichier, () => {
        fs.unwatchFile(fichier);
        console.log(`mise à jour ${__filename}`);
        delete require.cache[fichier];
        require(fichier);
    });
    main();
}, 5000);
