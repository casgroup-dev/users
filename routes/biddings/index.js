const router = require('express').Router()
const {roles} = require('../../models/index')
const {token} = require('../../controllers/auth/index')
const {result} = require('../../controllers/utils/index')
const {input, bidding, files} = require('../../controllers/biddings/index')

router.post('/',
  token.validate,
  token.validate.roles([roles.platform.admin]),
  input.validate.creation,
  bidding.create,
  result.send
)

router.post('/technical-offer/:url',
  token.validate,
  input.validate.fileUrl,
  files.postTechnicalOffer,
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
