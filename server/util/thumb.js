const fs = require('fs');
const imageThumbnail = require('image-thumbnail');
const options = { percentage: 5, responseType: 'buffer' }

const addPhoto = async (title, fullPath) => {
  try {
    debugger;
    const filename = fullPath.replace(/^.*[\\\/]/, '');
    const outFileName = 'thumb_' + filename;
    const thumbnail = await imageThumbnail(fullPath, options);

    fs.writeFileSync(outFileName, thumbnail, () => {
      console.log('finished with file');
    });
    console.log(thumbnail);

  } catch (e) {
    console.log('error', e);
    return [];
  }

}

const createThumb = async (buf) => {
  const options = { percentage: 5, responseType: 'buffer' }
  try {

    const thumbnail = await imageThumbnail(buf, options);

    return thumbnail;

  } catch (e) {
    console.log('error', e);
    return [];
  }

}

module.exports = { createThumb };