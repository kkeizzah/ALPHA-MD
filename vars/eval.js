const handleEvalCommand = async (zk, texte, origineMessage, superUser, conf, repondre) => {
  if (texte && texte.startsWith('>')) {
    // If the sender is not the owner
    if (!superUser) {
      const menuText = `This command is only for the owner to execute 🚫`;

      await zk.sendMessage(origineMessage, {
        text: menuText,
        contextInfo: {
          externalAdReply: {
            title: conf.BOT,
            body: conf.OWNER_NAME,
            sourceUrl: conf.GURL,
            thumbnailUrl: conf.URL,
            mediaType: 1,
            showAdAttribution: true,
            renderLargerThumbnail: false
          }
        }
      });
      return; 
    }

    try {
      let evaled = await eval(texte.slice(1));

      // If the evaluated result is not a string, convert it to a string
      if (typeof evaled !== 'string') evaled = require('util').inspect(evaled);

      // Send back the result of the evaluation
      await repondre(evaled);
    } catch (err) {
      // If there's an error, send the error message
      await repondre(String(err));
    }
  }
};

module.exports = handleEvalCommand;
