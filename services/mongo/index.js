const mongoose = require('mongoose')
const logger = require('winston-namespace')('services:mongodb')

mongoose.connect(`${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${process.env.MONGODB_NAME}`)
  .then(() => logger.info('Mongodb connected and ready.'))
  .catch(err => logger.error(err))

module.exports = mongoose
