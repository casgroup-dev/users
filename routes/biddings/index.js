const router = require('express').Router()
const {roles} = require('../../models/index')
const {token} = require('../../controllers/auth/index')
const {result} = require('../../controllers/utils/index')
const {approve, input, bidding, files, users, publish} = require('../../controllers/biddings/index')

router.post('/',
  token.validate,
  token.validate.roles([roles.platform.admin]),
  input.validate.creation,
  bidding.create,
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

router.put('/:id/publish/results',
  token.validate,
  token.validate.roles([roles.platform.admin]),
  publish.results,
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

/* Receive an array with the name of the company approved as: ['Microsoft', 'Apple', ...] */
router.put('/:id/approve/technically',
  token.validate,
  token.validate.roles([roles.platform.admin]), // Only admin can approve
  approve.technically,
  result.send
)

/* Receive an object with the itemName and the businessNames to approve */
router.put('/:id/approve/economically',
  token.validate,
  token.validate.roles([roles.platform.admin]),
  approve.economically,
  result.send
)

/* Publish the results of the bidding */
// router.put('/:id/publish/result',)

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

router.post('/:id/addUser/:userid',
  token.validate,
  users.post.addUser,
  result.send
)

router.post('/:id/participate',
  token.validate,
  users.post.participate,
  result.send
)

module.exports = router
