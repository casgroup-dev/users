const logger = require('winston-namespace')('auth:files')
const aws = require('../../../services/aws')

const sign = {
  /**
   * Middleware to sign a request to upload a new file to the S3 bucket in AWS.
   * @param {Object} req - Request object with query params: 'fileName', 'contentType' and 'biddingId'.
   * @param {Object} res - Response object.
   * @param {Function} next - Function to call the next middleware.
   */
  put: function (req, res, next) {
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `${Date.now()}-${req.query.fileName.replace(/\s/g, '_')}`, // File's name or key of the file. Replace white spaces with underscores.
      Expires: 300, // The link expires in 5 minutes
      ContentType: req.query.contentType,
      ACL: 'public-read'
    }
    aws.s3.getSignedUrl('putObject', params, (err, signedRequest) => {
      if (err) {
        logger.error(err)
        err = new Error('Error while retrieving signed url to upload a file to S3.')
        err.status = 500
        return next(err)
      }
      req.body = {signedRequest, url: `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${params.Key}`}
      return next()
    })
  }
}

/**
 * Generates a middleware that validates that the request has the given params in the query path.
 * @param {String[]} params - Array of strings of parameters to look for in the query path.
 */
function validateParams (params) {
  return (req, res, next) => {
    for (let param of params) {
      if (!req.query[param]) {
        let err = new Error(`The request must have the parameter '${param}' in the query parameters.`)
        err.status = 400
        return next(err)
      }
    }
    return next()
  }
}

module.exports = {
  sign,
  validate: {
    put: validateParams(['fileName', 'contentType'])
  }
}
