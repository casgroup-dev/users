const router = require('express').Router()
const {roles} = require('../../models')
const {token} = require('../../controllers/auth')
const {input, users} = require('../../controllers/users')
const {result} = require('../../controllers/utils')

/* Creation of a user using POST method */
router.post('/',
  token.validate,
  token.validate.roles([roles.platform.admin, roles.platform.shadowUser]),
  input.validate.creation,
  users.create,
  result.send
)

/* Check if the token is from an admin. Returns json with boolean property 'isAdmin'. */
router.get('/is-admin',
  token.validate.isAdmin,
  result.send
)

/* Get information of the user using GET method */
router.get('/:email',
  token.validate,
  token.validate.roles([roles.platform.admin]),
  users.get,
  result.send
)

/* Edit user using PUT method */
router.put('/:email',
  token.validate,
  token.validate.roles([roles.platform.admin]),
  users.update,
  result.send
)

/* Remove an user with the DELETE method */
router.delete('/:email',
  token.validate,
  token.validate.roles([roles.platform.admin]),
  users.remove,
  result.send
)

module.exports = router
