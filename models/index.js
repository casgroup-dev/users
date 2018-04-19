const mongoose = require('../services/mongo')
require('mongoose-type-email')

const UserModelName = 'User'
const CompanyModelName = 'Company'
/* The user can be an admin of the system, does not confuse this role with the role of the user in a billing */
const roles = {admin: 'admin', user: 'user', companyAdmin: 'companyAdmin'}

/* Company schema */
const companySchema = mongoose.Schema({
  name: {type: String, required: true, unique: true, index: true},
  industry: {type: String, required: true, index: true},
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
 * Token model to store valid tokens.
 * @type {Model}
 */
const Token = mongoose.model('Token', mongoose.Schema({
  token: {type: String, required: true, unique: true},
  email: {type: mongoose.SchemaTypes.Email, required: true, unique: true}
}))

module.exports = {
  Company,
  Token,
  User,
  roles
}
