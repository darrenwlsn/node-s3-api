const fs = require('fs');

const path = './outfile.txt';


const writeMyFile = async (fileName, data) => {
  let writeStream = fs.createWriteStream(fileName);

  writeStream.write(data, 'utf-8');

  writeStream.on('finish', () => {
    console.log(`finished writing data to file ${fileName}`);
  });

  writeStream.end();
};

module.exports = { writeMyFile };