const router = require('express').Router()
const {input, users, result} = require('../../controllers/users')

/* Creation of a user using POST method */
router.post('/',
  input.validate.creation,
  users.create,
  result.send
)

/* Get information of the user using GET method */
router.get('/:email',
  users.get,
  result.send
)

/* Edit user using PUT method */
router.put('/:email',
  input.validate.edition,
  users.update,
  result.send
)

/* Remove an user with the DELETE method */
router.delete('/:email',
  users.remove,
  result.send
)

module.exports = router
