const mongoose = require('mongoose')
const logger = require('winston-namespace')('services:mongodb')

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/test'

logger.info(`Trying to connect to MongoDB URI: ${uri}`)

mongoose.connect(uri)
  .then(() => logger.info('MongoDB connected and ready.'))
  .catch(err => logger.error(err))

module.exports = mongoose
