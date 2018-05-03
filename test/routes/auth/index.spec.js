/* global describe it afterEach */
require('dotenv').config()
const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../../../app')
const mongoose = require('../../../services/mongo')
const DatabaseCleaner = require('database-cleaner')
const {createUser, userPassword} = require('../users/index.spec')

chai.use(chaiHttp)
chai.should()
const databaseCleaner = new DatabaseCleaner('mongodb')

describe('AUTH', () => {
  afterEach(done => databaseCleaner.clean(mongoose.connections[0].db, function () {
    console.log('DB cleaned successfully.')
    done()
  }))
  it('Should return the error indicating that the email does not exists', done => {
    chai.request(app)
      .post('/api/auth/login')
      .send({email: 'email@example.com', password: 'sdjksdhsad'})
      .then(res => {
        res.body.should.have.property('error')
        console.log(res.body)
        done()
      })
  })
  it('Should perform a correct login', done => {
    createUser()
      .then(({res}) => {
        return chai.request(app)
          .post('/api/auth/login')
          .send({email: res.body.email, password: userPassword})
      })
      .then(res => {
        res.body.should.have.property('token')
        console.log(res.body)
        done()
      })
  })
  it('Should return an error with an incorrect login', done => {
    createUser()
      .then(({res}) => {
        return chai.request(app)
          .post('/api/auth/login')
          .send({email: res.body.email, password: 'this is not the password'})
      })
      .then(res => {
        res.body.should.have.property('error')
        console.log(res.body)
        done()
      })
  })
  it('Should perform a correct login and validates the token given', done => {
    createUser()
      .then(({res}) => {
        return chai.request(app)
          .post('/api/auth/login')
          .send({email: res.body.email, password: userPassword})
      })
      .then(res => {
        console.log(`Token: ${res.body.token}`)
        return chai.request(app)
          .get(`/api/auth/${res.body.token}`)
      })
      .then(res => {
        res.status.should.be.equal(200)
        console.log(res.body)
        done()
      })
      .catch(err => console.log(err))
  })
  it('Should return an error when the token is invalid', done => {
    chai.request(app)
      .get('/api/auth/thisIsNotaToken')
      .then(res => {
        res.status.should.be.equal(403)
        res.body.should.have.property('error')
        res.body.error.should.have.property('status')
        res.body.error.status.should.be.equal(403)
        res.body.error.should.have.property('message')
        console.log(res.body)
        done()
      })
  })
})
