const { keith } = require('../keizzah/keith');
const axios = require("axios");
let { Sticker, createSticker, StickerTypes } = require('wa-sticker-formatter');
const { isUserBanned, addUserToBanList, removeUserFromBanList } = require("../bdd/banUser");
const { addGroupToBanList, isGroupBanned, removeGroupFromBanList } = require("../bdd/banGroup");
const { isGroupOnlyAdmin, addGroupToOnlyAdminList, removeGroupFromOnlyAdminList } = require("../bdd/onlyAdmin");
const { removeSudoNumber, addSudoNumber, issudo } = require("../bdd/sudo");
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

/*keith({ nomCom: "crew", categorie: "Mods" }, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg, auteurMessage, superUser, auteurMsgRepondu, msgRepondu } = commandeOptions;

  if (!superUser) { repondre("Only mods can use this command"); return; }

  if (!arg[0]) { repondre('Please enter the name of the group to create'); return; }
  if (!msgRepondu) { repondre('Please mention a member to add'); return; }

  const name = arg.join(" ");
  const group = await zk.groupCreate(name, [auteurMessage, auteurMsgRepondu]);
  console.log("Created group with ID: " + group.gid);
  zk.sendMessage(group.id, { text: `Bienvenue dans ${name}` });
});

keith({ nomCom: "join", categorie: "Mods" }, async (dest, zk, commandeOptions) => {
  const { arg, repondre, superUser } = commandeOptions;

  if (!superUser) {
    repondre("Command reserved for the bot owner");
    return;
  }

  let result = arg[0].split('https://chat.whatsapp.com/')[1];
  await zk.groupAcceptInvite(result);
  repondre('Success').catch(() => {
    repondre('Unknown error');
  });
});

keith({ nomCom: "jid", categorie: "Mods" }, async (dest, zk, commandeOptions) => {
  const { arg, repondre, superUser, auteurMessage, msgRepondu } = commandeOptions;

  if (!superUser) {
    repondre("Command reserved for the bot owner");
    return;
  }

  let jid = msgRepondu ? auteurMsgRepondu : dest;
  zk.sendMessage(dest, { text: jid }, { quoted: ms });
});

keith({ nomCom: "block", categorie: "Mods" }, async (dest, zk, commandeOptions) => {
  const { arg, repondre, verifGroupe, msgRepondu, superUser, auteurMessage, auteurMsgRepondu } = commandeOptions;

  if (!superUser) {
    repondre("Command reserved for the bot owner");
    return;
  }

  let jid = msgRepondu ? auteurMsgRepondu : dest;

  await zk.updateBlockStatus(jid, "block")
    .then(() => repondre('Success'))
    .catch(() => repondre('Unknown error'));
});

keith({ nomCom: "unblock", categorie: "Mods" }, async (dest, zk, commandeOptions) => {
  const { arg, repondre, verifGroupe, msgRepondu, superUser, auteurMessage, auteurMsgRepondu } = commandeOptions;

  if (!superUser) {
    repondre("Command reserved for the bot owner");
    return;
  }

  let jid = msgRepondu ? auteurMsgRepondu : dest;

  await zk.updateBlockStatus(jid, "unblock")
    .then(() => repondre('Success'))
    .catch(() => repondre('Unknown error'));
});

keith({ nomCom: "kickall", categorie: 'Group', reaction: "📣" }, async (dest, zk, commandeOptions) => {
  const { auteurMessage, ms, repondre, verifGroupe, superUser } = commandeOptions;

  if (!verifGroupe) { repondre("This command is reserved for groups"); return; }
  const metadata = await zk.groupMetadata(dest);

  if (superUser || auteurMessage == metadata.owner) {
    repondre('No admin members will be removed from the group. You have 5 seconds to reclaim your choice by restarting the bot.');
    await sleep(5000);
    let membresGroupe = verifGroupe ? await zk.groupParticipants(dest) : "";
    try {
      let users = membresGroupe.filter((member) => !member.admin);
      for (const membre of users) {
        await zk.groupParticipantsUpdate(dest, [membre.id], "remove");
        await sleep(500);
      }
    } catch (e) {
      repondre("I need administration rights");
    }
  } else {
    repondre("Order reserved for the group owner for security reasons");
  }
});

keith({ nomCom: 'ban', categorie: 'Mods' }, async (dest, zk, commandeOptions) => {
  const { ms, arg, auteurMsgRepondu, msgRepondu, repondre, superUser, prefixe } = commandeOptions;

  if (!superUser) {
    repondre('This command is only allowed to the bot owner');
    return;
  }

  if (!arg[0]) {
    repondre(`Mention the victim by typing ${prefixe}ban add/del to ban/unban the victim`);
    return;
  }

  if (msgRepondu) {
    switch (arg.join(' ')) {
      case 'add':
        let youareban = await isUserBanned(auteurMsgRepondu);
        if (youareban) {
          repondre('This user is already banned');
          return;
        }
        addUserToBanList(auteurMsgRepondu);
        break;
      case 'del':
        let estbanni = await isUserBanned(auteurMsgRepondu);
        if (estbanni) {
          removeUserFromBanList(auteurMsgRepondu);
          repondre('This user is now free.');
        } else {
          repondre('This user is not banned.');
        }
        break;
      default:
        repondre('Bad option');
        break;
    }
  } else {
    repondre('Mention the victim');
    return;
  }
});

keith({ nomCom: 'bangroup', categorie: 'Mods' }, async (dest, zk, commandeOptions) => {
  const { ms, arg, repondre, superUser, verifGroupe, prefixe } = commandeOptions;

  if (!superUser) {
    repondre('This command is only allowed to the bot owner');
    return;
  }

  if (!verifGroupe) {
    repondre('Order reserved for groups');
    return;
  }

  if (!arg[0]) {
    repondre(`Type ${prefixe}bangroup add/del to ban/unban the group`);
    return;
  }

  const groupalreadyBan = await isGroupBanned(dest);
  switch (arg.join(' ')) {
    case 'add':
      if (groupalreadyBan) {
        repondre('This group is already banned');
        return;
      }
      addGroupToBanList(dest);
      break;
    case 'del':
      if (groupalreadyBan) {
        removeGroupFromBanList(dest);
        repondre('This group is now free.');
      } else {
        repondre('This group is not banned.');
      }
      break;
    default:
      repondre('Bad option');
      break;
  }
});

keith({ nomCom: 'onlyadmin', categorie: 'Group' }, async (dest, zk, commandeOptions) => {
  const { ms, arg, repondre, superUser, verifGroupe, verifAdmin, prefixe } = commandeOptions;

  if (!superUser && !verifAdmin) {
    repondre('You are not entitled to this order');
    return;
  }

  if (!verifGroupe) {
    repondre('Order reserved for groups');
    return;
  }

  if (!arg[0]) {
    repondre(`Type ${prefixe}onlyadmin add/del to ban/unban the group`);
    return;
  }

  const groupalreadyBan = await isGroupOnlyAdmin(dest);
  switch (arg.join(' ')) {
    case 'add':
      if (groupalreadyBan) {
        repondre('This group is already in onlyadmin mode');
        return;
      }
      addGroupToOnlyAdminList(dest);
      break;
    case 'del':
      if (groupalreadyBan) {
        removeGroupFromOnlyAdminList(dest);
        repondre('This group is now free.');
      } else {
        repondre('This group is not in onlyadmin mode.');
      }
      break;
    default:
      repondre('Bad option');
      break;
  }
});

keith({ nomCom: 'sudo', categorie: 'Mods' }, async (dest, zk, commandeOptions) => {
  const { ms, arg, repondre, superUser, prefixe } = commandeOptions;

  if (!superUser) {
    repondre('This command is only allowed to the bot owner');
    return;
  }

  if (!arg[0]) {
    repondre(`Mention the person by typing ${prefixe}sudo add/del`);
    return;
  }

  if (msgRepondu) {
    switch (arg.join(' ')) {
      case 'add':
        let youaresudo = await issudo(auteurMsgRepondu);
        if (youaresudo) {
          repondre('This user is already sudo');
          return;
        }
        addSudoNumber(auteurMsgRepondu);
        repondre('Success');
        break;
      case 'del':
        let estsudo = await issudo(auteurMsgRepondu);
        if (estsudo) {
          removeSudoNumber(auteurMsgRepondu);
          repondre('This user is now non-sudo.');
        } else {
          repondre('This user is not sudo.');
        }
        break;
      default:
        repondre('Bad option');
        break;
    }
  } else {
    repondre('Mention the victim');
    return;
  }
});

keith({ nomCom: 'mention', categorie: 'Mods' }, async (dest, zk, commandeOptions) => {
  const { ms, repondre, superUser, arg } = commandeOptions;
  
  if (!superUser) { 
    repondre('You do not have the rights for this command');
    return;
  }

  const mbdd = require('../bdd/mention');
  let alldata = await mbdd.recupererToutesLesValeurs();
  let data = alldata[0];

  if (!arg || arg.length < 1) {
    let etat = (alldata.length === 0 || data.status === 'non') ? 'Desactived' : 'Actived';
    let mtype = data.type || 'no data';
    let url = data.url || 'no data';
    let msg = `Status: ${etat}
Type: ${mtype}
Link: ${url}

*Instructions:*
To activate or modify the mention, follow this syntax: mention link type message
The different types are audio, video, image, and sticker.
Example: mention https://static.animecorner.me/2023/08/op2.jpg image Hi, my name is Luffy

To stop the mention, use mention stop`;

    repondre(msg);
    return;
  }

  if (arg.length >= 2) {
    if (arg[0].startsWith('http') && ['image', 'audio', 'video', 'sticker'].includes(arg[1])) {
      let message = arg.slice(2).join(' ') || '';
      await mbdd.addOrUpdateDataInMention(arg[0], arg[1], message);
      await mbdd.modifierStatusId1('oui');
      repondre('Mention updated');
    } else {
      repondre('Instructions: To activate or modify the mention, follow this syntax: mention link type message. The different types are audio, video, image, and sticker.');
    }
  } else if (arg.length === 1 && arg[0] === 'stop') {
    await mbdd.modifierStatusId1('non');
    repondre('Mention stopped');
  } else {
    repondre('Please make sure to follow the instructions');
  }
});*/

keith({ nomCom: "vv", aliases: ["send", "keep"], categorie: "Mods" }, async (dest, zk, commandeOptions) => {
  const { repondre, msgRepondu, superUser } = commandeOptions;

  if (msgRepondu) {
    console.log(msgRepondu);
    let msg;
    try {
      // Check for different message types and handle accordingly
      if (msgRepondu.imageMessage) {
        const media = await zk.downloadAndSaveMediaMessage(msgRepondu.imageMessage);
        msg = { image: { url: media }, caption: msgRepondu.imageMessage.caption };
      } else if (msgRepondu.videoMessage) {
        const media = await zk.downloadAndSaveMediaMessage(msgRepondu.videoMessage);
        msg = { video: { url: media }, caption: msgRepondu.videoMessage.caption };
      } else if (msgRepondu.audioMessage) {
        const media = await zk.downloadAndSaveMediaMessage(msgRepondu.audioMessage);
        msg = { audio: { url: media }, mimetype: 'audio/mp4' };
      } else if (msgRepondu.stickerMessage) {
        const media = await zk.downloadAndSaveMediaMessage(msgRepondu.stickerMessage);
        const stickerMess = new Sticker(media, {
          pack: 'ALPHA-MD',
          type: StickerTypes.CROPPED,
          categories: ["🤩", "🎉"],
          id: "12345",
          quality: 70,
          background: "transparent",
        });
        const stickerBuffer2 = await stickerMess.toBuffer();
        msg = { sticker: stickerBuffer2 };
      } else {
        msg = { text: msgRepondu.conversation };
      }

      // Send the message
      await zk.sendMessage(dest, msg);

    } catch (error) {
      console.error("Error processing the message:", error);
      repondre('An error occurred while processing your request.');
    }

  } else {
    repondre('Mention the message that you want to save');
  }
});
keith({ nomCom: "vv2", aliases: ["v2", "keep2"], categorie: "Mods" }, async (dest, zk, commandeOptions) => {

  const { repondre , msgRepondu , superUser, auteurMessage } = commandeOptions;
  
    if ( superUser) { 
  
      if(msgRepondu) {

        console.log(msgRepondu) ;

        let msg ;
  
        if (msgRepondu.imageMessage) {
  
          
  
       let media  = await zk.downloadAndSaveMediaMessage(msgRepondu.imageMessage) ;
       // console.log(msgRepondu) ;
       msg = {
  
         image : { url : media } ,
         caption : msgRepondu.imageMessage.caption,
         
       }
      
  
        } else if (msgRepondu.videoMessage) {
  
          let media  = await zk.downloadAndSaveMediaMessage(msgRepondu.videoMessage) ;
  
          msg = {
  
            video : { url : media } ,
            caption : msgRepondu.videoMessage.caption,
            
          }
  
        } else if (msgRepondu.audioMessage) {
      
          let media  = await zk.downloadAndSaveMediaMessage(msgRepondu.audioMessage) ;
         
          msg = {
     
            audio : { url : media } ,
            mimetype:'audio/mp4',
             }     
          
        } else if (msgRepondu.stickerMessage) {
  
      
          let media  = await zk.downloadAndSaveMediaMessage(msgRepondu.stickerMessage)
  
          let stickerMess = new Sticker(media, {
            pack: 'ALPHA-MD',
            type: StickerTypes.CROPPED,
            categories: ["🤩", "🎉"],
            id: "12345",
            quality: 70,
            background: "transparent",
          });
          const stickerBuffer2 = await stickerMess.toBuffer();
         
          msg = { sticker: stickerBuffer2}
  
  
        }  else {
            msg = {
               text : msgRepondu.conversation,
            }
        }
  
      zk.sendMessage(auteurMessage,msg)
  
      } else { repondre('Mention the message that you want to save') }
  
  } else {
    repondre('only mods can use this command')
  }
  

  })
;
