const fs = require('fs');
const _ = require('lodash');
const yargs = require('yargs');
const photo = require('./photo');

const titleOptions = {
  describe: 'The title of the photo',
  demand: true,
  alias: 't'

};

const fileLocationOptions = {
  describe: 'The location of the file to upload',
  demand: true,
  alias: 'l'
};

const argv = yargs.
  command('add', 'Add a new image', {
    title: titleOptions,
    location: fileLocationOptions
  })
  .help()
  .argv;

const command = argv._[0];

if (command === 'add') {
  console.log(`you tried add: ${argv.title} and ${argv.location}`);
  photo.addPhoto('turtle sands playground', 'images/turtle.jpg');
} else {
  console.log('user input command is not recognised');
}