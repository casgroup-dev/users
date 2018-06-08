const router = require('express').Router()
const {roles} = require('../../models')
const {token} = require('../../controllers/auth')
const {result} = require('../../controllers/utils')
const {input, bidding, questions} = require('../../controllers/biddings')

router.post('/',
  token.validate,
  token.validate.roles([roles.platform.admin]),
  input.validate.creation,
  bidding.create,
  result.send
)

router.put('/:id/questions',
  token.validate,
  token.validate.roles([roles.platform.user]),
  input.validate.questions,
  questions.update,
  result.send
)

router.get('/',
  token.validate,
  bidding.get.all,
  result.send
)

router.get('/:id',
  token.validate,
  bidding.get.byId,
  result.send
)

router.put('/:id',
  token.validate,
  // token.validate.roles([roles.platform.admin]),
  input.validate.update,
  bidding.update,
  result.send
)

router.delete('/:id',
  token.validate,
  token.validate.roles([roles.platform.admin]),
  bidding.remove,
  result.send
)

module.exports = router
