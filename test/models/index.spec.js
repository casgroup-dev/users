/* global describe it afterEach */
/* These global variables comes from Mocha package */
require('dotenv').config()

const chai = require('chai')
const {Company, User, roles} = require('../../models')
const mongoose = require('../../services/mongo')
const DatabaseCleaner = require('database-cleaner')

const databaseCleaner = new DatabaseCleaner('mongodb')

chai.should()

/* Some dev advices:
 * In windows you can start MongoDB with mongod command. Make sure you're in correct installation directory or you've
 * added it to your PATH env variable.
 * Also, there is a weird phenomena: when you run each test by its own they are correct, but when you run both
 * together they have problems.
 */

describe('User model', () => {
  const companyData = {name: 'Microsoft', industry: 'TI'}

  afterEach(done => databaseCleaner.clean(mongoose.connections[0].db, function () {
    console.log('DB cleaned successfully.')
    done()
  }))
  it('Should create a Company', done => {
    let company = new Company(companyData)
    company.save()
      .then(() => Company.findOne({name: company.name}))
      .then(company => company.remove())
      .then(() => Company.findOne({name: company.name}))
      .then(company => chai.expect(company).to.not.exist)
      .then(() => done())
  })
  it('Should create a user and add it its company', done => {
    const email = 'email@email.com'
    let company = new Company(companyData)
    company.save()
      .then(company => new User({
        email: email,
        company: company._id,
        role: roles.user,
        password: 'gfbfgbgsbd',
        name: 'Tomás Perry'
      }).save())
      .then(() => User.findOne({company: company._id}).populate('company'))
      .then(user => {
        user.company.name.should.be.equal(company.name)
        user.remove()
        done()
      })
  })
  it('Should return an error when the input is not valid', done => {
    const company = new Company({name: 'name'})
    company.validate()
      .catch(err => {
        console.log(err.message)
        done()
      })
  })
})
