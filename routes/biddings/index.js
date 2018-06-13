const router = require('express').Router()
const {roles} = require('../../models')
const {token} = require('../../controllers/auth')
const {result} = require('../../controllers/utils')
const {input, bidding, files, questions} = require('../../controllers/biddings')

router.post('/',
  token.validate,
  token.validate.roles([roles.platform.admin]),
  input.validate.creation,
  bidding.create,
  result.send
)

router.put('/:id/questions',
  token.validate,
  // token.validate.roles([roles.platform.user]),
  input.validate.question,
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

router.get('/:id/documents/',
  token.validate,
  files.get.myFiles,
  result.send
)

router.get('/:id/documents/all/',
  token.validate,
  token.validate.roles([roles.platform.admin]),
  files.get.all,
  result.send
)

router.put('/:id',
  token.validate,
  token.validate.roles([roles.platform.admin]),
  input.validate.update,
  bidding.update,
  result.send
)

router.put('/:id/forms/economical',
  token.validate,
  bidding.economicalOfferTable,
  result.send
)

/* s3 url should come in body */
router.put('/:id/documents/:type', // Bidding id and type of the document economical or technical
  token.validate,
  input.validate.fileUrl,
  files.putDocumentUrl,
  result.send
)

router.delete('/:id',
  token.validate,
  token.validate.roles([roles.platform.admin]),
  bidding.remove,
  result.send
)
/* Input body with field name */
router.delete('/:id/documents/:type',
  token.validate,
  token.validate.roles([roles.platform.user]),
  files.remove,
  result.send
)

module.exports = router
