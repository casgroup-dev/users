const router = require('express').Router()
const {roles} = require('../../models')
const {token} = require('../../controllers/auth')
const {result} = require('../../controllers/utils')

router.post('/',
  token.validate,
  token.validate.roles([roles.admin]),
  // add input validation
  // add post
  result.send
)

router.get('/:id',
  token.validate,
  token.validate.roles([roles.admin]), // roles.companyAdmin]),
  // add get here
  result.send
)

router.put('/:id',
  token.validate,
  token.validate.roles([roles.admin]),
  // add input validation here
  // add update here
  result.send
)
