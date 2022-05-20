const { logger } = require('../../service/logger.service')

const extractProductInfo = (event) => {
  try {
    const { options, ...restEvents } = event

    return (options
      ? options.map((option) => {
        const { sizes, ...restOptions } = option

        // If type is AP or sizes are empty for option,
        // then picking data from option level
        if (event.type.toUpperCase() == 'AP' || (sizes && sizes.length == 0)) {
          return {
            options: [{
              ...restOptions,
              sizes
            }],
            ...restEvents,
            type: event.type
          }
        }
      }) :
      []).flat()
  } catch (err) {
    logger.error({ err }, 'Error on extract product Info')
    throw err
  }
}

const dssEventTransform = ({ product_data }) => {
  try {
    return extractProductInfo(product_data)
  } catch (err) {
    logger.error({ err: err.data || err, product_data }, 'Error on dss event transfom to model')
    throw err
  }
}

module.exports = {
  dssEventTransform
}
