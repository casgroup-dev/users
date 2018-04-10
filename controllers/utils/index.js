const format = {
  /**
   * Format and the set default options.
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  options: (req, res, next) => {
    req.options = req.query
    req.options.q = req.options.q || null
    req.options.page = req.options.page || 1
    return next()
  }
}

module.exports = {
  format
}
