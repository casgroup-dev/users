const express = require('express')
const cors = require('cors')
const routes = require('./routes')
const {format} = require('./controllers/utils')

const app = express()

if (process.env.NODE_ENV !== 'production') app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(format.options)

/* API Routes */
app.use('/api', routes)

/* FRONT */
app.use(express.static('front'))

/* Catch 404 and forward to error handler */
app.use(function (req, res, next) {
  const err = new Error('Not found.')
  err.status = 404
  next(err)
})

/* Error handler */
app.use(function (err, req, res, next) {
  res.json({
    error: {
      status: err.status || 500,
      message: err.message || 'Internal server error'
    }
  })
})

module.exports = app
