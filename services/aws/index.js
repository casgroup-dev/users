const aws = require('aws-sdk')
const s3 = new aws.S3() // Initialising the s3 object automatically loads the AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY variables

module.exports = {
  s3
}
