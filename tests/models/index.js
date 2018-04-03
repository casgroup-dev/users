/* global describe it */

require('dotenv').config()  /* Configuro las variables de entorno */

const chai = require('chai')
const User = require('../../models')

chai.should()

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

    /* Si se guardó el user debería poder ser eliminado */
    User.remove({email:'mail@mail.com'}, err => {
      chai.expect(err).to.not.exist
      done() /* Recordar naturaleza asíncrona de Node */
    })
  }).timeout(20000)
})