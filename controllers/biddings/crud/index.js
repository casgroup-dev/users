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
async function create (req, res, next) {
  let newBidding = req.body.bidding
  const user = await getCurrentUser(req.options.token || req.params.token)
  newBidding.users.push({
    user: user,
    role: 'engineer'
  })
  newBidding.save()
    .then(bidding => {
      req.body = bidding
      next()
    })
    .catch(err => {
      logger.error(err)
      err = new Error('Internal error while storing the new bidding instance.')
      err.status = 500
      next(err)
    })
}

function getCurrentUser (tokn) {
  return token.getData(tokn)
    .then(token => {
      return User.findOne({'email': token.email})
        .then(user => {
          return user
        })
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
          throw err
        }
        return biddings
      })
      .then(biddings => {
        const tokenData = token.getData(req.options.token || req.params.token)
        const filterData = (bidding) => filterDataByRole(bidding, tokenData.role, tokenData.email)
        biddings.map(filterData)
        biddings.map(getCleanAndPopulatedBidding)
        req.body = biddings
        next()
      })
      .catch(err => {
        logger.error(err)
        err = new Error('Internal error while retrieving the biddings list.')
        err.status = 500
        next(err)
      })
  },

  // TODO filter to only send a user's data, if you are provider
  /**
   * Given a bidding name in params, return the specific bidding info according to user role requesting it.
   * @param req
   * @param res
   * @param next
   */
  byId: (req, res, next) => {
    Bidding.findOne({_id: req.params.id})
      .populate({path: 'users.user', populate: {path: 'company'}})
      .then(async bidding => {
        if (!bidding) {
          const err = new Error('No bidding found')
          err.status = 404
          next(err)
        }
        return {bidding, tokenData: token.getData(req.options.token)}
      })
      .then(async ({bidding, tokenData}) => {
        const boolDeadlines = checkDeadlines(bidding.deadlines)
        req.body = await filterIdBiddingByRole(bidding, tokenData.role, tokenData.email, boolDeadlines)
        next()
      })
      .catch(err => {
        logger.error(err)
        err = new Error('Internal error while retrieving the bidding data.')
        err.status = 500
        next(err)
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
    .then(async bidding => {
      if (!bidding) {
        const err = new Error('Can\'t update. No such bidding')
        err.status = 404
        next(err)
      }
      let tempBid = await getUsers(req.body)
      uniteBidding(bidding, tempBid)
      bidding.set(tempBid)
      bidding.save()
      req.body = {}
      next()
    })
    .catch(err => {
      logger.error(err)
      err = new Error('Internal error while retrieving the bidding data.')
      err.status = 500
      next(err)
    })
}

function uniteBidding(currentBidding, newBidding) {
  currentBidding.bidderCompany = newBidding.bidderCompany
  currentBidding.title = newBidding.title
  currentBidding.deadlines = newBidding.deadlines
  currentBidding.rules = newBidding.rules
  currentBidding.biddingType = newBidding.biddingType
  currentBidding.economicalForm = newBidding.economicalForm
  for (let i = 0; i < newBidding.users.length; ++i) {
    let user = newBidding.users[i]
    if (!currentBidding.users.includes(user.user)) {
      currentBidding.users.push(user)
    }
  }
}

async function getUsers (bidding) {
  return Promise.all(bidding.users.map(async (current, index, users) => {
    await User.findOne({email: current.email})
      .then(user => {
        users[index].user = user
        delete users[index].email
      })
      .catch(err => {
        logger.error(err)
        err = new Error('Error while populating.')
        err.status = 500
        throw err
      })
  }))
    .then(() => {
      return bidding
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
      next()
    })
    .catch(err => {
      logger.error(err)
      err = new Error('Error while removing the bidding instance.')
      err.status = 500
      next(err)
    })
}

function getCleanAndPopulatedBidding (bidding) {
  Promise.all(bidding.users.map(async (current, index, users) => {
    await User.findOne({_id: current.id})
      .then(user => {
        users[index] = {
          role: current.role,
          email: user.email
        }
      })
      .catch(err => {
        logger.error(err)
        err = new Error('Error while populating.')
        err.status = 500
      })
  }))
    .then(() => {
      return bidding
    })
}

/**
 * Checks the current dates and deadlines.
 * @param deadlines
 * @returns showable
 */
function checkDeadlines (deadlines) {
  const stages = {
    onQuestions: false,
    onQuestionsAnswers: false,
    onTechnicalReception: false,
    onEconomicalReception: false,
    onTechnicalEvaluation: false,
    onEconomicalEvaluation: false,
    onTechnicalVisit: false,
    onResults: false
  }
  const currentDate = Date()
  if (currentDate > deadlines.questions.start &&
    currentDate < deadlines.questions.end) {
    stages.onQuestions = true
  }
  if (currentDate > deadlines.answers.start &&
    currentDate < deadlines.answers.end) {
    stages.onQuestionsAnswers = true
  }
  if (currentDate > deadlines.reception.start &&
    currentDate < deadlines.reception.end) {
    stages.onReception = true
  }
  if (currentDate > deadlines.technicalEvaluation.start &&
    currentDate < deadlines.technicalEvaluation.end) {
    stages.onTechnicalEvaluation = true
  }
  if (currentDate > deadlines.economicalEvaluation.start &&
    currentDate < deadlines.economicalEvaluation.end) {
    stages.onEconomicalEvaluation = true
  }
  if (currentDate > deadlines.technicalVisit.start &&
    currentDate < deadlines.technicalVisit.end) {
    stages.onTechnicalVisit = true
  }
  if (currentDate > deadlines.results.date) {
    stages.onResults = true
  }
  return stages
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
    await User.findOne({email: email})
      .then(user => {
        if (!user) {
          return {}
        }
        bidding.users = bidding.users.filter((current) => {
          return current.id.equals(user._id)
        })
      })
  } else if (role === roles.platform.shadowUser) {
    return {}
  }
  return bidding // role === admin sends all info without modification
}

/**
 * Filter data by user role and the current deadlines state.
 * @param bidding
 * @param role
 * @param email
 * @param boolDeadlines
 */
async function filterIdBiddingByRole (bidding, role, email, boolDeadlines) {
  const permissions = {
    seeParticipants: false,
    uploadTechnical: false,
    uploadEconomical: false,
    reviewTechnical: false,
    reviewEconomical: false,
    askQuestion: false,
    seeQuestions: false,
    answerQuestions: false,
    seeAnswers: false,
    sendNotice: false,
    canModify: false,
    seeSchedule: true,
    seeEconomicalFormSpecs: false
  }
  if (role === roles.platform.user || role === roles.platform.companyAdmin) {
    /* permissions */
    permissions.uploadTechnical = boolDeadlines.onReception
    permissions.uploadEconomical = boolDeadlines.onReception
    permissions.askQuestion = boolDeadlines.onQuestions
    permissions.seeAnswersQuestion = boolDeadlines.onQuestionsAnswers
    permissions.sendNotice = true

    /* create */
    const userBidding = {
      id: bidding._id,
      title: bidding.title,
      rules: bidding.rules,
      users: bidding.users,
      questions: bidding.questions,
      deadlines: bidding.deadlines,
      economicalForm: bidding.economicalForm,
      publishedResults: bidding.publishedResults,
      permissions: permissions
    }
    await User.findOne({email: email})
      .then(user => {
        if (user) {
          userBidding.users = bidding.users.filter((current) => {
            return current.user.equals(user._id)
          })
          userBidding.questions = bidding.questions.filter((current) => {
            return current.user.equals(user._id)
          })

          return userBidding
        } else {
          return {}
        }
      })
    return userBidding
  } else if (role === roles.platform.shadowUser) {
    return {}
  } else {
    /* permissions */
    permissions.seeParticipants = true
    permissions.reviewTechnical = boolDeadlines.onTechnicalEvaluation
    permissions.reviewEconomical = boolDeadlines.onEconomicalEvaluation
    permissions.seeQuestion = boolDeadlines.onQuestions || boolDeadlines.onQuestionsAnswers
    permissions.answerQuestions = boolDeadlines.onQuestions || boolDeadlines.onQuestionsAnswers
    permissions.canModify = true

    /* create */
    return {
      id: bidding._id,
      title: bidding.title,
      rules: bidding.rules,
      economicalForm: bidding.economicalForm,
      bidderCompany: bidding.bidderCompany,
      users: bidding.users,
      questions: bidding.questions,
      deadlines: bidding.deadlines,
      publishedResults: bidding.publishedResults,
      permissions
    } // role === admin sends all info without modification
  }
}

function economicalOfferTable (req, res, next) {
  token.getUserId(req.params.token || req.options.token)
    .then(async userId => {
      let bidding = await Bidding.findOne({_id: req.params.id, 'users.user': userId})
      if (!bidding) {
        const err = new Error('No such bidding')
        err.status = 404
        throw err
      }
      let participant = bidding.users.find((biddingParticipant) => {
        if (biddingParticipant.user.equals(userId)) { // ObjectID comparision
          return true
        }
      })
      participant.economicalFormAnswers = req.body
      bidding.save()
      next()
    })
    .catch(err => {
      next(err)
    })
}

module.exports = {
  create,
  get,
  update,
  economicalOfferTable,
  remove
}
