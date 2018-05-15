const router = require('express').Router()
const {roles} = require('../../models')
const {token} = require('../../controllers/auth')
const {result} = require('../../controllers/utils')
const {input, bidding} = require('../../controllers/biddings')

router.post('/',
  token.validate,
  token.validate.roles([roles.admin]),
  input.validate.creation,
  bidding.create,
  result.send
)

router.get('/:id',
  token.validate,
  token.validate.roles([roles.admin, roles.companyAdmin]),
  bidding.get,
  result.send
)

router.put('/:id',
  token.validate,
  token.validate.roles([roles.admin]),
  input.validate.update,
  bidding.update,
  result.send
)
