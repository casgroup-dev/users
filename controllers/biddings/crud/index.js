const logger = require('winston-namespace')('bidding:crud')
const {Bidding, User, roles} = require('../../../models')
const {token} = require('../../auth')

/**
 * Creates a bidding given the data of the body.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
function create (req, res, next) {
  req.body.bidding.save()
    .then(bidding => {
      req.body = bidding
      return next()
    })
    .catch(err => {
      logger.error(err)
      err = new Error('Internal error while storing the new bidding instance.')
      err.status = 500
      return next(err)
    })
}

const get = {

  /**
   * Given a provider in params, returns all biddings of that provider.
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */

  all: (req, res, next) => {
    Bidding.find()
      .then(biddings => {
        if (!biddings) {
          const err = new Error(`There are no biddings yet`)
          err.status = 404
          return next(err)
        }
        const tokenData = token.getData(req.options.token)
        const filterData = (bidding) => filterDataByRole(bidding, tokenData.role, tokenData.email)
        biddings.map(filterData)
        biddings.map(getCleanAndPopulatedBidding)
        req.body = biddings
        return next()
      })
      .catch(err => {
        logger.error(err)
        err = new Error('Internal error while retrieving the biddings list.')
        err.status = 500
        return next(err)
      })
  },

  /**
   * Given a bidding name in params, return all bidding info according user role requesting it.
   * @param req
   * @param res
   * @param next
   */
  byId: (req, res, next) => {
    Bidding.findOne({_id: req.params.id})
      .then(async bidding => {
        if (!bidding) {
          const err = new Error('No bidding found')
          err.status = 404
          return next(err)
        }
        token.getData(req.options.token)
          .then(async tokenData => {
            var deadlines = checkDeadlines(bidding.deadlines)
            var filteredBidding = await filterDataByRole(bidding, tokenData.role, tokenData.email)
            filteredBidding['showable'] = deadlines
            // filteredBidding = await getCleanAndPopulatedBidding(filteredBidding)
            req.body = filteredBidding
            return next()
          })
          .catch(err => {
            logger.error(err)
            err = new Error('cago.')
            err.status = 500
            return next(err)
          })
      })
      .catch(err => {
        logger.error(err)
        err = new Error('Internal error while retrieving the bidding data.')
        err.status = 500
        return next(err)
      })
  }
}

/**
 * Updates a bidding with the data coming from the body of the request.
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
function update (req, res, next) {
  Bidding.findOne({_id: req.params.id})
    .then(bidding => {
      if (!bidding) {
        const err = new Error("Can't update. No such bidding")
        err.status = 404
        return next(err)
      }
      bidding.set(req.body)
      getCleanAndPopulatedBidding(bidding)
      req.body = bidding
      next()
    })
    .catch(err => {
      logger.error(err)
      err = new Error('Internal error while retrieving the bidding data.')
      err.status = 500
      return next(err)
    })
}

/**
 * Removes a bidding by its name.
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
function remove (req, res, next) {
  Bidding.remove({_id: req.params.id})
    .then(() => {
      req.body = {message: 'Success.'}
      return next()
    })
    .catch(err => {
      logger.error(err)
      err = new Error('Error while removing the bidding instance.')
      err.status = 500
      return next(err)
    })
}

function getCleanAndPopulatedBidding (bidding) {
  var cleanBiddingUsers = []
  Promise.all(bidding.users.map(async (current, index, users) => {
    await User.findOne({_id: current.user})
      .then(user => {
        cleanBiddingUsers.push({
          'user': user.email,
          'economicalFormAnswers': users[index].economicalFormAnswers
        })
      })
  }))
    .then(() => {
      logger.info(cleanBiddingUsers)
      return cleanBiddingUsers
    })
}

/**
 * Checks the current dates and deadlines and determines
 * what should be showed.
 * @param deadlines
 * @returns showable
 */
function checkDeadlines (deadlines) {
  var showable = {
    showQuestions: false,
    showQuestionsAnswers: false,
    showTechnicalReception: false,
    showEconomicalReception: false,
    showTechnicalEvaluation: false,
    showEconomicalEvaluation: false,
    showTechnicalVisit: false,
    showResults: false
  }
  const currentDate = Date()
  if (currentDate > deadlines.questions.start &&
    currentDate < deadlines.questions.end) {
    showable.showQuestions = true
  }
  if (currentDate > deadlines.questionsAnswers.start &&
    currentDate < deadlines.questionsAnswers.end) {
    showable.showQuestionsAnswers = true
  }
  if (currentDate > deadlines.technicalReception.start &&
    currentDate < deadlines.technicalReception.end) {
    showable.showTechnicalReception = true
  }
  if (currentDate > deadlines.economicalReception.start &&
    currentDate < deadlines.economicalReception.end) {
    showable.showEconomicalReception = true
  }
  if (currentDate > deadlines.technicalEvaluation.start &&
    currentDate < deadlines.technicalEvaluation.end) {
    showable.showTechnicalEvaluation = true
  }
  if (currentDate > deadlines.economicalEvaluation.start &&
    currentDate < deadlines.economicalEvaluation.end) {
    showable.showEconomicalEvaluation = true
  }
  if (currentDate > deadlines.technicalVisit.start &&
    currentDate < deadlines.technicalVisit.end) {
    showable.showTechnicalVisit = true
  }
  if (currentDate > deadlines.results) {
    showable.showResults = true
  }
  return showable
}

/**
 * Filter data by user role. IMPORTANT: This modifies the bidding object
 * if role is admin receives all data
 * if role is user or companyAdmin receives all data except data from other users in users array.
 * if users is not in users array receives anything
 * if role is shadowUser receives anything
 *
 * @param bidding
 * @param role
 * @param email
 */
async function filterDataByRole (bidding, role, email) {
  if (role === roles.platform.user || role === roles.platform.companyAdmin) {
    var userBidding = {}
    userBidding.title = bidding.title
    userBidding.rules = bidding.rules
    userBidding.users = bidding.users
    userBidding.questions = bidding.questions
    userBidding.deadlines = bidding.deadlines
    await User.findOne({email: email})
      .then(user => {
        if (!user) {
          return {}
        }
        userBidding.users = bidding.users.filter((current) => {
          return current.user.equals(user._id)
        })
        userBidding.questions = bidding.questions.filter((current) => {
          return current.user.equals(user._id)
        })
      })
    return userBidding
  } else if (role === roles.platform.shadowUser) {
    for (let field in bidding) delete bidding[field]
  } else {
    var adminBidding = {}
    adminBidding.title = bidding.title
    adminBidding.rules = bidding.rules
    adminBidding.bidderCompany = bidding.bidderCompany
    adminBidding.users = bidding.users
    adminBidding.questions = bidding.questions
    adminBidding.deadlines = bidding.deadlines
    return adminBidding // role === admin sends all info without modification
  }
}

module.exports = {
  create,
  get,
  update,
  remove
}
