const bidding = require('./crud')
const files = require('./files')
const notices = require('./notices')
const {Bidding, User, roles} = require('../../models')
const logger = require('winston-namespace')('bidding')

const input = {
  validate: {
    /**
     * Validates and create (without saving) a company.
     *
     * body has the following format:
     * { name: 'Licitacion1',
         bidderCompany: 'Mandante1',
         bases: { shortDescription: 'Licitación para comprar PCs gamers', fullText: 'bases.pdf'}
         periods: []
         users:
          [ { email: 'admin1@mail.com', role: 'engineer' },
            { email: 'client1@mail.com', role: 'reviser'} ] }

     email field in users field will be replaced for its id to match bidding schema

     * @param {Object} req
     * @param {Object} res
     * @param {Function} next
     */
    creation: (req, res, next) => {
      console.log(req.body)
      // logger.info(req.body)
      if (!req.body) {
        const err = new Error('No body')
        err.code = 400
        logger.error(err)
        return next(err)
      }
      if (!req.body.title || !req.body.bidderCompany || !req.body.biddingType) {
        const err = new Error('No bidding title, bidder company or bidding type')
        err.code = 400
        logger.error(err)
        return next(err)
      }

      validateBiddingUsers(req.body.users)
        .then(users => {
          req.body.users = users
          const bidding = new Bidding(req.body)
          bidding.validate()
            .then(() => {
              req.body = {bidding: bidding}
              return next()
            })
            .catch(err => {
              err.status = 400
              logger.error(err)
              return next(err)
            })
        })
    },

    /**
     * Validates any input to update bidding
     * @param req
     * @param res
     * @param next
     */
    update: (req, res, next) => {
      const biddingFields = Object.keys(Bidding.schema.obj)
      const updateFields = Object.keys(req.body)
      if (isSuperSet(biddingFields, updateFields)) {
        next()
      } else {
        const err = new Error(
          `Validation error. Request contains some unknown fields-\n
          \tAllowed fields: '${biddingFields}'\n
          \tRequested fields: '${updateFields}'`)
        err.status = 400
        next(err)
      }
      next()
    },

    /**
     * Validates that a notice isn't empty.
     * @param req
     * @param res
     * @param next
     */
    notices: (req, res, next) => {
      if (!req.body.noticeText) {
        const err = new Error('Notice field is empty')
        err.code = 400
        logger.error(err)
        return next(err)
      }
    },

    fileUrl: (req, res, next) => {
      /* https://stackoverflow.com/questions/26726862/how-to-determine-if-object-exists-aws-s3-node-js-sdk
      *  Should verify url is valid, i.e, file has been uploaded. Why this could be important (or even critical)?
      *  It's suppose that the frontend gives s3 url to backend. So, what happens if someone intercepts that url and
      *  replaces it by a malicious one? Above link maybe can give us a way to check that.
      */
      if (!req.body.hasOwnProperty('url') && !req.body.hasOwnProperty('name')) {
        const err = new Error(`No url or name provided '${req.body}'.`)
        err.status = 400
        next(err)
      }

      if (req.params.type !== 'economical' && req.params.type !== 'technical') {
        const err = new Error(`Invalid document type: '${req.params.type}'.
             Allowed types are 'economical' and 'technical'`)
        err.status = 400
        next(err)
      }
      // Puts a name for default. TODO: Consult this
      next()
    }
  }
}

function isSuperSet (s1, s2) {
  for (let elem of s2) {
    if (!s1.has(elem)) {
      return false
    }
  }
  return true
}

/**
 * Validates users from bidding form.
 * Check that emails exists on DB and replaces emails with users ID
 * @param users
 */
function validateBiddingUsers (users) {
  const cpUsers = Object.assign([], users)
  // Reference: https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/Objetos_globales/Array/map
  return new Promise(resolve => {
    return Promise.all(cpUsers.map(async function (currentUser, index, users) {
      await User.findOne({'email': currentUser.email}) // Receives email from front
        .then(user => {
          if (!user) {
            const err = new Error(`No user with email '${currentUser.email}'.`)
            err.status = 404
            throw err
          } else {
            if (!(currentUser.role in roles.bidding)) {
              const err = new Error(`Invalid role '${currentUser.role}'.`)
              err.status = 400 // Bad request
              throw err
            }
            const validatedUser = Object.assign({}, currentUser)
            delete validatedUser.email
            validatedUser.id = user.id
            cpUsers[index] = validatedUser
            return validatedUser // We actually modify input array
          }
        })
    }))
      .then(() => {
        // logger.info(users)
        resolve(cpUsers)
      })
  })
}

module.exports = {
  bidding,
  files,
  input,
  notices
}
