const router = require('express').Router()
const {roles} = require('../../models')
const {input, users, result} = require('../../controllers/users')
const {validateToken} = require('../../controllers/utils')

/* Creation of a user using POST method */
router.post('/',
  ...validateToken.createMiddleware([roles.admin]),
  input.validate.creation,
  users.create,
  result.send
)

/* Get information of the user using GET method */
router.get('/:email',
  ...validateToken.createMiddleware([roles.admin]),
  users.get,
  result.send
)

/* Edit user using PUT method */
router.put('/:email',
  ...validateToken.createMiddleware([roles.admin]),
  users.update,
  result.send
)

/* Remove an user with the DELETE method */
router.delete('/:email',
  ...validateToken.createMiddleware([roles.admin]),
  users.remove,
  result.send
)

module.exports = router
