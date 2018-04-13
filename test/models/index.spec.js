/* global describe it afterEach */
/* These global variables comes from Mocha package */
require('dotenv').config()

const chai = require('chai')
const {Company, User} = require('../../models')
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

afterEach(() => databaseCleaner.clean(mongoose.connections[0].db, function () {
  console.log('DB cleaned successfully.')
}))

describe('User model', () => {
  const company = new Company({name: 'Microsoft', industry: 'TI'})
  it('Should create a Company', done => {
    company.save()
      .then(() => Company.findOne({name: company.name}))
      .then(company => company.remove())
      .then(() => Company.findOne({name: company.name}))
      .then(company => chai.expect(company).to.not.exist)
      .then(() => done())
      .catch(err => {
        console.log(err)
        chai.expect(err).to.not.exist
      })
  })
  it('Should create a user and add it its company', done => {
    const email = 'email@email.com'
    company.save()
      .then(company => {
        const user = new User({
          email: email,
          company: company._id,
          role: 'consultor1',
          password: 'gfbfgbgsbd',
          name: 'Tomás Perry'
        })
        return user.save()
      })
      .then(() => User.findOne({company: company._id}).populate('company'))
      .then(user => {
        user.should.exist
        user.company.name.should.be.equal(company.name)
        user.remove()
        done()
      })
      .catch(err => {
        console.log(err)
        chai.expect(err).to.not.exist
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
