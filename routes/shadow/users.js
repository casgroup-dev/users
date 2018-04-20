const router = require('express').Router()
const {roles} = require('../../models')
const {token} = require('../../controllers/auth')
const {create, get, input} = require('../../controllers/users/shadow')
const {result} = require('../../controllers/utils')

/* Creation of a user using POST method */
router.post('/',
  token.validate,
  token.validate.roles([roles.admin]),
  input.validate,
  create,
  result.send
)

/* Get information of the user using GET method */
router.get('/:email',
  get,
  token.create,
  result.send
)

module.exports = router
