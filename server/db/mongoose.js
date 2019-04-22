var mongoose = require('mongoose');

mongoose.Promise = global.Promise;


const connect = async () => {
  console.log(mongoose.version);

  const start = Date.now();
  const opts = { useNewUrlParser: true, connectTimeoutMS: 1000 };
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/PhotoAlbumApp', opts).
    catch(error => {
      console.log(`Caught "${error.message}" after ${Date.now() - start} ms`);
      console.log('Check mongodb is up at ' + process.env.MONGODB_URI);
      process.exit(-1);
    });

}

connect().then(() => console.log('Successfully connected to MongoDB!!')).catch(error => console.error(error.stack));


module.exports = { mongoose };