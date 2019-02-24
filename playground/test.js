const md5 = require('md5');

var fileExt = '';
switch ("image/jpeg") {
  case "image/jpeg": {
    fileExt = '.jpg';
    break;
  }
}

console.log(fileExt);

const data = "my string value"; 
var buf = Buffer.from(data, 'utf8');

console.log(`'"${md5(buf)}"'`);