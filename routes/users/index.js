const router = require('express').Router()
const {roles} = require('../../models')
const {token} = require('../../controllers/auth')
const {input, users} = require('../../controllers/users')
const {result} = require('../../controllers/utils')

/* Creation of a user using POST method */
router.post('/',
  token.validate,
  token.validate.roles([roles.admin]),
  input.validate.creation,
  users.create,
  result.send
)

/* Get information of the user using GET method */
router.get('/:email',
  token.validate,
  token.validate.roles([roles.admin]),
  users.get,
  result.send
)

/* Edit user using PUT method */
router.put('/:email',
  token.validate,
  token.validate.roles([roles.admin]),
  users.update,
  result.send
)

/* Remove an user with the DELETE method */
router.delete('/:email',
  token.validate,
  token.validate.roles([roles.admin]),
  users.remove,
  result.send
)

module.exports = router
