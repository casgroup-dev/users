/* global describe it afterEach */
require('dotenv').config()

const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../../../app')
const {Company, User} = require('../../../models')
const mongoose = require('../../../services/mongo')
const DatabaseCleaner = require('database-cleaner')

chai.use(chaiHttp)
const databaseCleaner = new DatabaseCleaner('mongodb')

afterEach(() => databaseCleaner.clean(mongoose.connections[0].db, function () {
  console.log('DB cleaned successfully.')
}))

describe('USERS', () => {
  it('Should create a new user', done => {
    /* Create company to test adding a user */
    new Company({name: 'Microsoft', industry: 'TI'}).save()
      .then(company => {
        return chai.request(app)
          .post('/users')
          .send({
            email: 'example@microsoft.com',
            company: company._id,
            role: 'proveedor',
            password: 'myPassword',
            name: 'Felipe Gonzales'
          })
      })
      .then(res => {
        console.log(res.body)
        done()
      })
      .catch(err => console.log(err))
  })
})
