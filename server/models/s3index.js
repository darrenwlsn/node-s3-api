const mongoose = require('mongoose');


var S3Index = mongoose.model('S3Index', {
  s3Bucket: {
    type: String,
    required: true,
    unique: false
  },
  userBucket: {
    type: String,
    required: true,
    unique: false
  },
  userFolder: {
    type: String,
    required: true,
    unique: false
  },
  key: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: false
  },
  caption: {
    type: String,
    required: false
  },
  keywords: [{
    keyword: {
      type: String,
      required: false
    }
  }]
});


module.exports = { S3Index };