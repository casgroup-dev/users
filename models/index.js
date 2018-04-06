const mongoose = require('../services/mongo')
require('mongoose-type-email')

const usersSchema = mongoose.Schema({
  email: {type: mongoose.SchemaTypes.Email, required: true, unique: true},
  company: {type: String, required: true},
  role: {
    type: String,
    required: true,
    enum: ['administrador', 'consultor1', 'consultor2', 'proveedor', 'gestor', 'cliente']
  },
  hashpass: {type: String, required: true},
  phone: {type: String},
  name: {type: String, required: true}
})

const User = mongoose.model('User', usersSchema)
module.exports = User
