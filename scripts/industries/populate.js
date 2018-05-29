/**
 * This file reads a json file generated with industries_parser.py and populates database
 */
const {Industry} = require('../../models/index')
const file = require('./industries')

module.exports = () => {
  /* Return a promise */
  return new Promise(resolve => {
    Promise.all(file.map(async industry => {
      await Industry(industry).save()
    })).then(() => resolve())
  })
}
