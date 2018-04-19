/* global describe it afterEach */
require('dotenv').config()

const chai = require('chai')
const chaiHttp = require('chai-http')
const DatabaseCleaner = require('database-cleaner')
const app = require('../../../../app')
const mongoose = require('../../../../services/mongo')
const {createUserAndGetToken} = require('../../companies/index.spec')
const {roles} = require('../../../../models')

chai.use(chaiHttp)
chai.should()
const databaseCleaner = new DatabaseCleaner('mongodb')

const email = 'false@email.com'

describe('SHADOW USERS', () => {
  afterEach(done => databaseCleaner.clean(mongoose.connections[0].db, function () {
    console.log('DB cleaned successfully.')
    done()
  }))
  it('Should not pass without a token', done => {
    createShadowUser(null)
      .then(res => {
        console.log(res.body)
        res.body.should.have.property('error')
        res.body.error.status.should.be.equal(403)
        done()
      })
  })
  it('The admin can create a shadow user', done => {
    createUserAndGetToken(roles.admin)
      .then(createShadowUser)
      .then(validateResponse)
      .then(done)
  })
  it('Anybody can get the shadow user', done => {
    createUserAndGetToken(roles.admin)
      .then(createShadowUser)
      .then(() => chai.request(app).get(`/shadow/users/${email}`))
      .then(validateResponse)
      .then(done)
  })
})

function createShadowUser (token) {
  return chai.request(app).post(`/shadow/users?token=${token}`).send({email})
}

function validateResponse (res) {
  console.log(res.body)
  res.body.should.have.property('email')
  res.body.email.should.be.equal(email)
}
