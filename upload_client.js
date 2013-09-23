// Load the AWS SDK for Node.js
var AWS = require('aws-sdk'),
    fs = require('fs'),
    mime = require('mime');

AWS.config.loadFromPath('./aws.json');
AWS.config.update({region: 'us-east-1'});
var s3bucket = new AWS.S3({ params: { Bucket: 'webrtc-node-indy' } });

s3bucket.createBucket(function() {
  fs.readdirSync('./client')
    .map(function(clientFile) {
        return {
            Key: clientFile,
            Body: fs.readFileSync('./client/' + clientFile, 'utf-8'),
            ContentType: mime.lookup(clientFile)
        };
    })
    .forEach(function(file) {
        s3bucket.putObject(file, function(err, data) {
            if (err) {
                console.log('error ' + err);
            } else {
                console.log(file.Key + " uploaded");
            }
        });
    });
});
