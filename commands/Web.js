const { keith } = require('../keizzah/keith');
const axios = require('axios'); // Import axios
const cheerio = require('cheerio');

keith({
  nomCom: "web",
  aliases: ["inspectweb", "webinspect", "webscrap"],
  categorie: "coding",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { repondre, arg } = commandeOptions;

  if (!arg[0]) {
    return repondre('Provide a valid web link to fetch! The bot will crawl the website and fetch its HTML, CSS, JavaScript, and any media embedded in it!');
  }

  if (!arg[0].includes('https://')) {
    return repondre("That is not a valid link.");
  }

  try {
    // Use axios to fetch the webpage
    const response = await axios.get(arg[0]);
    const html = response.data;
    const $ = cheerio.load(html);

    const mediaFiles = [];
    $('img[src], video[src], audio[src]').each((i, element) => {
      let src = $(element).attr('src');
      if (src) {
        mediaFiles.push(src);
      }
    });

    const cssFiles = [];
    $('link[rel="stylesheet"]').each((i, element) => {
      let href = $(element).attr('href');
      if (href) {
        cssFiles.push(href);
      }
    });

    const jsFiles = [];
    $('script[src]').each((i, element) => {
      let src = $(element).attr('src');
      if (src) {
        jsFiles.push(src);
      }
    });

    await repondre(`**Full HTML Content**:\n\n${html}`);

    if (cssFiles.length > 0) {
      for (const cssFile of cssFiles) {
        const cssResponse = await axios.get(new URL(cssFile, arg[0]));
        const cssContent = cssResponse.data;
        await repondre(`**CSS File Content**:\n\n${cssContent}`);
      }
    } else {
      await repondre("No external CSS files found.");
    }

    if (jsFiles.length > 0) {
      for (const jsFile of jsFiles) {
        const jsResponse = await axios.get(new URL(jsFile, arg[0]));
        const jsContent = jsResponse.data;
        await repondre(`**JavaScript File Content**:\n\n${jsContent}`);
      }
    } else {
      await repondre("No external JavaScript files found.");
    }

    if (mediaFiles.length > 0) {
      await repondre(`**Media Files Found**:\n${mediaFiles.join('\n')}`);
    } else {
      await repondre("No media files (images, videos, audios) found.");
    }

  } catch (error) {
    console.error(error);
    // Return error in response
    return repondre(`An error occurred while fetching the website content: ${error.message}`);
  }
});
