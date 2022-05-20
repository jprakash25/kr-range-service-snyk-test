const models = require('../models')

exports.saveRangeList = async (rangeModel, transactionId = null) => {
  const { range_list } = models()
  const options = {}
  if (transactionId) {
    options.transactionId = transactionId
  }
  return range_list.create(rangeModel, options)
}
