const { S3Index } = require('../models/s3index');
const { S3Folders } = require('../models/s3folders');

const createBucketIndex = (idxData) => {
  console.log('creating bucket index');
  const { s3Bucket, userBucket, userFolder, key, title, caption, keywords } = idxData;
  var s3Index = new S3Index({
    s3Bucket, userBucket, userFolder, key, title, caption, keywords
  });

  try {
    s3Index.save().then(
      idx => {
        console.log('idx created for: ' + s3Index.key);
      },
      e => {
        console.log('error creating index for: ' + s3Index.key);
        console.log('Error Message: ' + e.message);
      }
    )
  }
  catch (e) {
    console.log(e);
  }
}

const updateBucketIndex = async (idxData) => {
  console.log('updating bucket index');
  var { s3Bucket, userBucket, userFolder, key, title, caption, keywords } = idxData;
  key = key.replace('thumb_', '');
  var s3Index = {
    s3Bucket, userBucket, userFolder, key, title, caption, keywords
  };

  try {
    return await S3Index.updateOne(
      {
        key: key
      },
      s3Index,
      { upsert: true },
      (err, raw) => {
        if (err) {
          console.log('error updating index for: ' + userBucket);
          throw e;
        }
        console.log(raw);
        return raw;
      }
    )
  } catch (e) {
    console.log(e);
  }


};

const retrieveBucketIndex = async (fileLoc) => {
  const myFileLoc = fileLoc.replace('thumb_', '');
  return await S3Index.findOne({
    key: myFileLoc
  }).then(data => {
    return data;
  },
    e => {
      console.log('error retrieving mete data for: ' + myFileLoc);
      return {};
    }
  );
};

const listFolders = async (userBucket) => {
  return await S3Folders.findOne({
    key: userBucket
  }).then(data => {
    if (!data) return [];
    return data.folders.map(folderName => {
      return { name: folderName }
    });
  },
    e => {
      console.log('error retrieving folders for: ' + userBucket);
      return [];
    }
  );
};

const saveFolders = async (userBucket, folderList) => {
  return await S3Folders.updateOne(
    {
      key: userBucket
    },
    {
      key: userBucket, folders: folderList
    },
    {
      upsert: true
    },
    (err, raw) => {
      if (err) {
        console.log('error saving folder list for: ' + userBucket);
        throw e;
      }
      console.log(raw);
      return raw;
    }
  );
};

module.exports = { createBucketIndex, retrieveBucketIndex, updateBucketIndex, listFolders, saveFolders };