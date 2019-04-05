require('dotenv').config();
const path = require('path');
const express = require('express'); //"^4.13.4"
const bodyParser = require('body-parser');
const s3Ops = require('./s3-ops');
const AWS = require('aws-sdk');
const multer = require('multer');

const publicPath = path.join(__dirname, '../public');
const storage = multer.memoryStorage();
//const upload = multer({ dest: 'images/' });
const upload = multer({ storage: storage });
var fs = require('fs');
const thumb = require('../thumb');




const arrContents = s3Ops.retrieveDirectoryListing(false).then((data) => {
  console.log('inside main with contents', data);
});

// const testNotes = s3Ops.downloadFile('wardrobe.jpg').then((data, err) => {
//   if (err) {
//     console.log('an error has occurred:', err);
//   } else {
//     let buffer = data.Body;
//     //console.log('data file returned', buffer.toString());
//     const result = fileWriter.writeMyFile('testout.jpg', buffer);
//   }
// });

const app = express();

const uploadToS3 = (req, res, next) => {
  if (req.file && req.file.buffer) {

    thumb.createThumb(req.file.buffer.toString('base64')).then((data) => {

      AWS.config.update({
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        accessKeyId: process.env.AWS_ACCESSKEY_ID,
        region: 'ap-southeast-2'
      });
      const s3 = new AWS.S3();

      s3.putObject({
        ACL: 'public-read',
        Bucket: process.env.AWS_BUCKET,
        Key: 'mythumb.jpg',
        Body: data
      }, function (err, data) {
        if (err) { throw err; }
        console.log(data);
      });

      s3.putObject({
        ACL: 'public-read',
        Bucket: process.env.AWS_BUCKET,
        Key: 'mythumbimage.jpg',
        Body: req.file.buffer
      }, function (err, data) {
        if (err) { throw err; }
        console.log(data);
      });

    });

  };

  next();
}

app.use(express.static(publicPath));
app.use(bodyParser.json());
app.use(uploadToS3);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/upload', upload.single('file'), uploadToS3, (req, res, next) => {
  res.send('Uploaded! ');
})


app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});

