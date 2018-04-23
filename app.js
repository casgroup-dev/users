const express = require('express')
const cors = require('cors')
const router = require('./routes')
const {format} = require('./controllers/utils')

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(format.options)

/* Routes */
app.use('/', router)

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
