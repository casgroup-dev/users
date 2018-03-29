const router = require('express').Router()
const {input, users, result} = require('../../controllers/auth')

/* Login and creation of the user's token */
router.post('/login',
  input.validate.login,
  users.login,
  users.token.create,
  result.send
)

router.get('/:token',
  users.token.validate,
  result.send
)

module.exports = router
