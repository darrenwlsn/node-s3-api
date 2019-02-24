require('dotenv').config();
const path = require('path');
const express = require('express'); //"^4.13.4"
const bodyParser = require('body-parser');
const s3Ops = require('./util/aws/s3-ops');
const multer = require('multer');

const publicPath = path.join(__dirname, './public');
const storage = multer.memoryStorage();
//const upload = multer({ dest: 'images/' });
const upload = multer({ storage: storage });


const arrContents1 = s3Ops.retrieveThumbs().then((data) => {
  console.log('inside main1 with contents', data);
});

const arrContents2 = s3Ops.retrieveDirectoryListing(false, 'Notes').then((data) => {
  console.log('inside main2 with contents', data);
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



// register middleware
app.use(express.static(publicPath));
app.use(bodyParser.json());
app.use(s3Ops.uploadToS3);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/thumbs/:folder?', (req, res) => {
  var folder = req.params.folder ? req.params.folder : '';
  const thumbs = s3Ops.retrieveThumbs(folder).then((data) => {
    if (!data) {
      res.status(404).send();
    } else {
      res.status(200).send(data);
    }
  })
    .catch(e => {
      res.status(400).send(e);
    });
});

app.post('/upload', upload.single('file'), s3Ops.uploadToS3, (req, res, next) => {
  res.send("Uploaded!");
})


app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});

