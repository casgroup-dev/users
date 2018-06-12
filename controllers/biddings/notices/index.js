const logger = require('winston-namespace')('bidding:notice')
const {Bidding, User, roles} = require('../../../models')
const {token} = require('../../auth')

function update (req, res, next) {

}

module.exports = {
  update
}
