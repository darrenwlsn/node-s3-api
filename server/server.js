require('dotenv').config();
const path = require('path');
const express = require('express'); //"^4.13.4"
const bodyParser = require('body-parser');
const s3Ops = require('./util/aws/s3-ops');
const multer = require('multer');
const OktaJwtVerifier = require('@okta/jwt-verifier');
const cors = require('cors');

const oktaJwtVerifier = new OktaJwtVerifier({
  issuer: 'https://dev-344587.okta.com/oauth2/default',
  clientId: '0oaemmoa1UV8x9Q9G356',
  assertClaims: {
    aud: 'api://default',
  },
});

const publicPath = path.join(__dirname, '../public');
const storage = multer.memoryStorage();
//const upload = multer({ dest: 'images/' });
const upload = multer({ storage: storage });


const arrContents1 = s3Ops.retrieveThumbs().then((data) => {
  console.log('inside main1 with contents', data);
});

const arrContents2 = s3Ops.retrieveDirectoryListing(false, 'Notes').then((data) => {
  console.log('inside main2 with contents', data);
});

const arrContents3 = s3Ops.retrieveDirectoryListing(true, null).then((data) => {
  console.log('inside main3 with contents', data);
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

/**
 * A simple middleware that asserts valid access tokens and sends 401 responses
 * if the token is not present or fails validation.  If the token is valid its
 * contents are attached to req.jwt
 */
function authenticationRequired(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const match = authHeader.match(/Bearer (.+)/);

  if (!match) {
    return res.status(401).end();
  }

  const accessToken = match[1];

  return oktaJwtVerifier.verifyAccessToken(accessToken)
    .then((jwt) => {
      req.jwt = jwt;
      next();
    })
    .catch((err) => {
      res.status(401).send(err.message);
    });
}

const app = express();
app.use(cors());
app.use(authenticationRequired);
// const basicAuth = require('express-basic-auth');

// app.use(basicAuth({
//   users: { 'darren': 'yamahamt09' },
//   challenge: true,
//   // realm: 'Imb4T3st4pp',
// }))

// register middleware
// app.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Methods", "POST, GET");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
//   next();
// });
app.use(express.static(publicPath));
app.use(bodyParser.json());
app.use(s3Ops.uploadToS3);


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/thumbs/:folder?', authenticationRequired, (req, res) => {
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

app.get('/folders', authenticationRequired, (req, res) => {
  const folders = s3Ops.retrieveDirectoryListing(true, null).then((data) => {
    if (!folders) {
      res.status(404).send();
    } else {
      res.status(200).send(data);
    }
  })
    .catch(e => {
      res.status(400).send(e);
    });
});


app.get('/contents/:folder', authenticationRequired, (req, res) => {
  const folder = req.param("folder");
  const contents = s3Ops.listBucketContents(false, folder).then((data) => {
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

app.post('/upload', authenticationRequired, upload.single('file'), s3Ops.uploadToS3, (req, res, next) => {
  res.send("Uploaded!");
})


app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}!`);
});

