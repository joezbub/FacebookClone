var aws = require('aws-sdk');
aws.config.update({ region: 'us-east-1' });
var s3 = new aws.S3();
const fs = require('fs')
const path = require('path')


async function putImage (file, filename, prefix) {
    
    const params = {
        Bucket: 'pennbookusermedia',
        Key: prefix + filename,
        Body: file.buffer,
        ContentType: file.mimetype
      }
     
      s3.upload(params, (err, data) => {
        if (err) console.log(err);
        else return data
      })
}

async function generateURL () {
    const imageName = 'arnav'

    const params = {
        Bucket: 'pennbookusermedia',
        Key: imageName,
        Expires: 60,
      }

    const url = await s3.getSignedUrlPromise('putObject', params);
    return url;
}

var methods = {
    putImage,
    generateURL
}

module.exports = methods;