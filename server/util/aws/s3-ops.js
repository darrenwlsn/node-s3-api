require('dotenv').config();
const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');
const thumb = require('../../util/thumb');
const md5 = require('md5');

aws.config.update({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESSKEY_ID,
  region: 'ap-southeast-2'
});

const s3 = new aws.S3();
const mybucket = process.env.AWS_BUCKET;


const uploadFile =
  multer({
    storage: multerS3({
      s3: s3,
      acl: 'public-read',
      bucket: process.env.AWS_BUCKET,
      key: function (req, file, cb) {
        console.log(file);
        cb(null, file.originalname); //use Date.now() for unique file keys
      }
    })
  });

const downloadFile = async fileName => {
  return await downloadFileFromS3(fileName);
};

const downloadFileFromS3 = async fileName => {
  let params = {
    Bucket: process.env.AWS_BUCKET,
    Key: fileName
  };

  const resp = new Promise((resolve, reject) => {
    s3.getObject(params, function (err, data) {
      if (err) {
        console.log(err, err.stack);
        // an error occurred
      } else {
        console.log(`retrieved data successfully from s3 for file ${fileName}`);
        //console.log(data); // successful response
        resolve(data);
      }
    });
  });
  return resp;
};

const uploadToS3 = (req, res, next) => {
  // if (req.file && req.file.buffer && req.body.title) {
  if (req.file && req.file.buffer) {
    const title = req.body.title;
    const description = req.body.description;
    const folder = req.body.selectedFolder;
    var fileExt = '';
    switch (req.file.mimetype) {
      case "image/jpeg": {
        fileExt = 'jpg';
        break;
      }
      case "image/gif": {
        fileExt = 'gif';
        break;
      }
      case "image/png": {
        fileExt = 'png';
        break;
      }
    }

    thumb.createThumb(req.file.buffer.toString('base64')).then((data) => {

      console.log(`'"${md5(data)}"'`);
      const s3 = new aws.S3();

      s3.putObject({
        ACL: 'public-read',
        Bucket: `${process.env.AWS_BUCKET}/${folder}`,
        Key: `thumb_${title}.${fileExt}`,
        Metadata: { title: title, description: description },
        Body: data,
        //ContentMD5: `"${md5(data)}"`
      }, function (err, res) {
        if (err) {
          console.log(err);
          res.send('error !' + err.message);
        } else {
          if (`"${md5(data)}"` !== res.ETag) {
            console.log('error no match on md5 for thumb: ' + `"${md5(data)}"` + ' and ETag: ' + res.ETag);
            res.send('error no match on md5 of thumb');
          } else {
            console.log(`upload completed: thumb_${title}.${fileExt} `);
            console.log(res);
          }

        }

      });

      s3.putObject({
        ACL: 'public-read',
        Bucket: `${process.env.AWS_BUCKET}/${folder}`,
        Key: `${title}.${fileExt}`,
        Body: req.file.buffer,
        //ContentMD5: md5(req.file.buffer).toString()
      }, function (err, res) {
        if (err) {
          console.log(err);
          res.send('error !' + err.message);
        } else {
          if (`"${md5(req.file.buffer)}"` !== res.ETag) {
            console.log('error no match on md5 for file: ' + `"${md5(req.file.buffer)}"` + ' and ETag: ' + res.ETag);
            res.send('error no match on md5 of file');
          } else {
            console.log(`upload completed: ${title}.${fileExt} `);
            console.log(res);
          }

        }

      });

    });

  };

  next();
}


const retrieveDirectoryListing = async (showFolders, startFolder) => {
  return await listBucketContents(showFolders, startFolder);
}

const retrieveThumbs = async (startFolder) => {
  result = [];
  result = await listBucketContents(false, startFolder).then(data => {
    return (data.filter(item => item.name.indexOf('thumb_') > -1
    ));
  });
  return result;
}

const listBucketContents = async (showFolders, startFolder) => {
  let params = {
    Bucket: process.env.AWS_BUCKET,
    Prefix: startFolder ? startFolder : '',
    MaxKeys: 20
  };

  return new Promise((resolve, reject) => {
    var files = s3.listObjects(params, function (err, data) {
      if (err) {
        console.log(err, err.stack);
        reject(err);
        // an error occurred
      } else {
        //console.log(data); // successful response

        const summary =
          data.Contents.filter(item => showFolders ? item.Size === 0 : item.Size > 0)
            .map(item => {
              return {
                lastModified: item.LastModified,
                size: item.Size,
                name: showFolders ? item.Key.substring(0, item.Key.length - 1) : `https://s3.amazonaws.com/${process.env.AWS_BUCKET}/${item.Key}`
              }
            });

        resolve(summary);
      }
    })
  })

};

module.exports = { uploadFile, downloadFile, uploadToS3, retrieveDirectoryListing, retrieveThumbs, listBucketContents };
