const bidding = require('./crud')
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
         bases: [ 'file1.pdf', 'file2.pdf' ],
         periods: []
         users:
          [ { email: 'admin1@mail.com', role: 'engineer' },
            { email: 'client1@mail.com', role: 'reviser', password: 'q12we34r' } ] }

     email field in users field will be replaced for its id to match bidding schema

     * @param {Object} req
     * @param {Object} res
     * @param {Function} next
     */
    creation: (req, res, next) => {
      if (!req.body) {
        const err = new Error('No body')
        err.code = 400
        logger.error(err)
        return next(err)
      }
      if (!req.body.name || !req.body.bidderCompany) {
        const err = new Error('No bidding name or bidder company')
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
      // TODO
      next()
    }
  }
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
            // TODO: Falta la creación de usuario si es que no existe
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
  input,
  bidding
}
