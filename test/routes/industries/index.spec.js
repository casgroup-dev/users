/* global describe it afterEach beforeEach */
/**
 *  INDUSTRIES TESTS: The database must be populated, run 'npm run populateIndustries'
 */
require('dotenv').config()
const chai = require('chai')
const chaiHttp = require('chai-http')
const DatabaseCleaner = require('database-cleaner')
const app = require('../../../app')
const mongoose = require('../../../services/mongo')
const {roles} = require('../../../models')
const {createUserAndGetToken} = require('../companies/index.spec')
const populateIndustries = require('../../../scripts/industries/populate')
const fs = require('fs')
const rawIndustriesCategories = JSON.parse(fs.readFileSync('./scripts/industries/industries.json'))

chai.use(chaiHttp)
chai.should()

const databaseCleaner = new DatabaseCleaner('mongodb')
const endpoint = '/api/industries'

describe('INDUSTRIES', () => {
  beforeEach(done => { populateIndustries().then(done) })
  afterEach(done => databaseCleaner.clean(mongoose.connections[0].db, function () {
    console.log('DB cleaned successfully.')
    done()
  }))
  it('Should not get the industries without a token', done => {
    chai.request(app).get(endpoint).then(res => {
      res.body.should.have.property('error')
      res.body.error.status.should.be.equal(403)
      done()
    })
  })
  it('Should get all the industries', done => {
    createUserAndGetToken(roles.platform.shadowUser)
      .then(token => chai.request(app).get(endpoint + `?token=${token}`))
      .then(res => {
        // If you want to check what is coming in the response:
        let checkResponseBody = false
        if (checkResponseBody) console.log(JSON.stringify(res.body, null, 2))
        let responseCategory
        let responseIndustry
        rawIndustriesCategories.map(industriesCategory => {
          // Should exist an industry with this category in the response
          responseCategory = res.body.find(responseCategory => responseCategory.category === industriesCategory.category)
          responseCategory.should.not.be.equal(undefined)
          // Each industry of this category should exist in the response
          industriesCategory.industries.map(industry => {
            responseIndustry = responseCategory.industries.find(responseIndustry => responseIndustry.name === industry.name)
            responseIndustry.should.not.be.equal(undefined)
            responseIndustry.name.should.be.equal(industry.name)
            responseIndustry.code.should.be.equal(Number(industry.code))
          })
        })
        done()
      })
  })
})
