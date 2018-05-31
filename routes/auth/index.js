const router = require('express').Router()
const {files, input, token, users} = require('../../controllers/auth')
const {result} = require('../../controllers/utils')

/* Login and creation of the user's token */
router.post('/login',
  input.validate.login,
  users.login,
  token.create,
  result.send
)

/* Validate a token using get method */
router.get('/:token',
  token.validate,
  result.send
)

/* Sign a url to upload a file from the client in the front to the S3 bucket */
router.get('/sign/put',
  files.validate.put,
  files.sign.put,
  result.send
)

module.exports = router
