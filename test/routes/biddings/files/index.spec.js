/* global describe it afterEach */
require('dotenv').config()
const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../../../../app')
const mongoose = require('../../../../services/mongo')
const DatabaseCleaner = require('database-cleaner')
const {Bidding} = require('../../../../models')

chai.use(chaiHttp)
chai.should()
const databaseCleaner = new DatabaseCleaner('mongodb')

describe('BIDDING FILES', () => {
  afterEach(done => databaseCleaner.clean(mongoose.connections[0].db, function () {
    console.log('DB cleaned successfully.')
    done()
  }))

  it('Should add a economical file to a user', done => {
    done()
  })

  it('Should add a technical file to a user', done => {
    done()
  })

  it(`Shouldn't add a file to a user if type is incorrect`, done => {
    done()
  })
})

/**
 * Creates a dummy bidding to setting up testing environment
 * Only uses required fields
 */
function createBidding (users) {
  return new Bidding({
    title: 'Test bidding',
    bidderCompany: 'The Company of Tests',
    biddingType: 2,
    users: users
  }).save()
}

/**
 * Returns a users lists in bidding format
 */
async function createUsers() {
  // TODO
}