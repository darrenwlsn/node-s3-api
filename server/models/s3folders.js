const mongoose = require('mongoose');

var S3Folders = mongoose.model('S3Folders', {
  key: {
    type: String,
    required: true,
    unique: true
  },
  folders: [{
    type: String,
    required: false
  }
  ]
});


module.exports = { S3Folders };