const router = require('express').Router()
const {input, users, result} = require('../../controllers/users')

/* Creation of a user using POST method */
router.post('/',
  input.validate.creation,
  users.create,
  result.send
)

/* Get information of the user using GET method */
router.get('/:id',
  users.get,
  result.send
)

/* Edit user using PUT method */
router.put('/:id',
  input.validate.edition,
  users.edit,
  result.send
)

module.exports = router
