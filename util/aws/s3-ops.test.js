require('dotenv').config();
const expect = require('expect');
const s3 = require('./s3-ops');

describe('My work', () => {
  test('works', () => {
    expect(2).toEqual(2)
  })
});

expect.extend({
  toContainObject(received, argument) {

    const pass = this.equals(received,
      expect.arrayContaining([
        expect.objectContaining(argument)
      ])
    )

    if (pass) {
      return {
        message: () => (`expected ${this.utils.printReceived(received)} not to contain object ${this.utils.printExpected(argument)}`),
        pass: true
      }
    } else {
      return {
        message: () => (`expected ${this.utils.printReceived(received)} to contain object ${this.utils.printExpected(argument)}`),
        pass: false
      }
    }
  }
});

describe('S3 file tests', () => {
  test('should download a file from s3', () => {
    // const ts = new Date().getTime();
    // const contents = `this is a test file created: ${ts}`;

    return s3.downloadFile('Notes/post.txt').then((data, err) => {
      let buffer = data.Body;
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.toString().trim()).toBe('this is a test file');
    });
  });

  test('should list folders in s3 location', () => {
    return s3.retrieveDirectoryListing(true, 'Notes').then((data) => {
      expect(data).toContainObject({ name: 'Notes/TestFolderA/' });
      expect(data).toContainObject({ name: 'Notes/TestFolderB/' });

    });
  });
});