/**
 * This file reads a json file generated with industries_parser.py and populates database
 */
const {Industry, IndustryCategory} = require('../../models/index')
const file = require('./industries')

module.exports = () => {
  /* Return a promise */
  return new Promise(resolve => {
    /* Wait for all industry category creation with promise.all() */
    Promise.all(file.map(async industryCategory => {
      const industryCategoryEntry = await new IndustryCategory({'name': industryCategory['category']}).save()
      /* Wait for all */
      return Promise.all(industryCategory['industries'].map(async industry => {
        await new Industry({
          'code': industry['code'],
          'name': industry['name'],
          'category': industryCategoryEntry.id
        }).save()
      }))
    })).then(() => resolve())
  })
}
