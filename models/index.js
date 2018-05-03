const mongoose = require('../services/mongo')
require('mongoose-type-email')

const UserModelName = 'User'
const ShadowUserModelName = 'ShadowUser'
const CompanyModelName = 'Company'
const IndustryCategoryName = 'IndustryCategory'
const BiddingModelName = 'Bidding'
/* The user can be an admin of the system, does not confuse this role with the role of the user in a billing */
const roles = {admin: 'admin', companyAdmin: 'companyAdmin', user: 'user', shadowUser: 'shadowUser'}

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
    default: roles.user,
    enum: Object.values(roles)
  },
  password: {type: String, required: true},
  phone: {type: String},
  name: {type: String, required: true}
}))

/**
 * Shadow User, to hold an invitated company with an email, until it registers and
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
 * Industry Category. The name for a set of industries
 * @type {Model}
 */
const IndustryCategory = mongoose.model(IndustryCategoryName, mongoose.Schema({
  name: {type: String, required: true, unique: true}
}))

/**
 * Industry. Code and name of a industry from S.I.I.
 * @type {Model}
 */
const Industry = mongoose.model('Industry', mongoose.Schema({
  code: {type: Number, required: true, unique: true},
  name: {type: String, required: true, unique: true},
  category: {type: mongoose.Schema.Types.ObjectId, ref: IndustryCategoryName, required: true}
}))

/**
 * Bidding. Its own model, belonging to a company and having several users asociated
 * @type {Model}
 */
const Bidding = mongoose.model(BiddingModelName, mongoose.Schema({
  name: {type: String, required: true, unique: true},
  company: {type: String, required: true},
  users: [{
    userId: {type: String},
    userRole: {type: String}
  }],
  // documents: [],
  bases: {type: String},
  periods: [{type: Date}]
}))

module.exports = {
  Company,
  Token,
  User,
  ShadowUser,
  roles,
  IndustryCategory,
  Industry,
  Bidding
}
