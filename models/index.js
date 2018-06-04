const mongoose = require('../services/mongo')
require('mongoose-type-email')

const UserModelName = 'User'
const ShadowUserModelName = 'ShadowUser'
const CompanyModelName = 'Company'
const BiddingModelName = 'Bidding'
/* The user can be an admin of the system, does not confuse this role with the role of the user in a billing */
const roles = {
  platform: {
    admin: 'admin',
    companyAdmin: 'companyAdmin',
    user: 'user',
    shadowUser: 'shadowUser'
  },
  bidding: {
    client: 'client',
    engineer: 'engineer',
    provider: 'provider'
  }
}

/* Company schema */
const companySchema = mongoose.Schema({
  businessName: {type: String, required: true, unique: true, index: true},
  fantasyName: {type: String, required: true, unique: true, index: true},
  rut: {type: Number, required: true, unique: true}, // TODO: RUT must be validated
  industries: [{type: String, required: true, index: true}],
  legalRepresentative: {type: String, required: true},
  legalRepEmail: {type: mongoose.SchemaTypes.Email, required: true},
  legalRepPhone: {type: Number}, // TODO: phone must be validated
  users: [{type: mongoose.Schema.Types.ObjectId, ref: UserModelName}]
})
companySchema.index({'$**': 'text'})
/**
 * Company model, it has an array of users' ids that must be populated to get it.
 * See: http://mongoosejs.com/docs/populate.html
 * @type {Model}
 */
const Company = mongoose.model(CompanyModelName, companySchema)

/**
 * User model, it has a company that is a reference the the Company model. To query this it must be populated.
 * See: http://mongoosejs.com/docs/populate.html
 * @type {Model}
 */
const User = mongoose.model(UserModelName, mongoose.Schema({
  email: {type: mongoose.SchemaTypes.Email, required: true, unique: true},
  company: {type: mongoose.Schema.Types.ObjectId, ref: CompanyModelName, required: true},
  role: {
    type: String,
    required: true,
    default: roles.platform.user,
    enum: Object.values(roles.platform)
  },
  password: {type: String, required: true},
  phone: {type: String},
  name: {type: String, required: true}
}))

/**
 * Shadow User, to hold an invited company with an email, until it registers and
 * becomes a normal user.
 * @type {Model}
 */
const ShadowUser = mongoose.model(ShadowUserModelName, mongoose.Schema({
  email: {type: mongoose.SchemaTypes.Email, required: true, unique: true},
  businessName: {type: String},
  phone: {type: String},
  name: {type: String}
}))

/**
 * Token model to store valid tokens.
 * @type {Model}
 */
const Token = mongoose.model('Token', mongoose.Schema({
  token: {type: String, required: true, unique: true},
  email: {type: mongoose.SchemaTypes.Email, required: true, unique: true}
}))

/**
 * Industry. Name of a set of industry plus code and name of a industry from S.I.I.
 * @type {Model}
 */
const Industry = mongoose.model('Industry', mongoose.Schema({
  category: {type: String, required: true, unique: true},
  industries: [{
    code: {type: Number, required: true, unique: true},
    name: {type: String, required: true, unique: true}
  }]
}))

/**
 * Bidding. Its own model, belonging to a bidderCompany and having several users associated
 * @type {Model}
 */
const Bidding = mongoose.model(BiddingModelName, mongoose.Schema({
  title: {type: String, required: true},
  bidderCompany: {type: String, required: true},
  rules: {
    // Summary of the rules or description of the bidding
    summary: String,
    // Files with all the rules
    files: [{
      name: String,
      url: String
    }]
  },
  economicalForm: [{
    itemName: String,
    wantedAmount: Number,
    measureUnit: String
  }],
  users: [{
    user: {type: mongoose.Schema.Types.ObjectId, ref: User, required: true},
    role: {
      type: String,
      required: true,
      default: roles.bidding.provider,
      enum: Object.values(roles.bidding)
    },
    // Only providers upload this documents
    documents: {
      economical: {name: String, url: String},
      technical: {name: String, url: String}
    },
    // Answers to the economical form
    economicalFormAnswers: [{
      itemName: String,
      Quantity: Number,
      costPerUnit: Number
    }]
  }],
  questions: [{
    user: {type: mongoose.Schema.Types.ObjectId, ref: User, required: true},
    question: {type: String, required: true},
    answer: String
  }],
  deadlines: { // Deadlines for this bidding
    questions: {start: Date, end: Date}, // Questions of the providers
    questionsAnswers: {start: Date, end: Date}, // Answers to the questions
    technicalReception: {start: Date, end: Date},
    economicalReception: {start: Date, end: Date}, // Offers from the providers
    technicalEvaluation: {start: Date, end: Date},
    economicalEvaluation: {start: Date, end: Date},
    technicalVisit: {start: Date, end: Date}, // Only informative
    results: Date
  },
  biddingType: {type: Number, required: true, enum: [1, 2]} // Bidding with 1 stage or two stages
}))

module.exports = {
  Bidding,
  Company,
  Industry,
  roles,
  ShadowUser,
  Token,
  User
}
