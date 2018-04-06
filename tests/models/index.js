/* global describe it */
/* describe comes from Mochajs package */

require('dotenv').config()  /* Configuro las variables de entorno */

const chai = require('chai')
const User = require('../../models')
const mongoose = require('../../services/mongo')
const DatabaseCleaner = require('database-cleaner')

const databaseCleaner = new DatabaseCleaner('mongodb')

chai.should()

/* Some dev advices:
 * In windows you can start MongoDB with mongod command. Make sure you're in correct installation directory or you've
 * added it to your PATH env variable.
 */

afterEach (function() {
  databaseCleaner.clean(mongoose.connections[0].db, function () {
    console.log('DB cleaned successfully.')
  })
})

/* beforeEach (function (){

}) */

describe('User model', () => {
  it('Should create a user', done => {

    const user = new User({
      email: 'mail@mail.com',
      company: 'DCC',
      role: 'consultor1',
      hashpass: 'gfbfgbgsbd',
      name: 'Tomás Perry'
    })

    user.save()

    /* If user was saved, we should be able to remove it from database */
    User.remove({email:'mail@mail.com'}, err => {
      chai.expect(err).to.not.exist
      done() /* Recordar naturaleza asíncrona de Node */
    })

  }).timeout(20000)
})