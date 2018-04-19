const router = require('express').Router()
const {input, token, users} = require('../../controllers/auth')
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

module.exports = router
