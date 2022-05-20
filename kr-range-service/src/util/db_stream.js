const QueryStream = require('pg-query-stream')
const { pgConnect, pgClose } = require('../db')
const { logger } = require('../service/logger.service')

const fetchDataStream = async (query, close) => {
  const client = await pgConnect()
  const stream = client.query(new QueryStream(query))

  stream
    .on('error', (err) => {
      logger.error(err, 'Error running query stream')
      pgClose()
      throw err
    })
    .on('end', () => {
      if (!close) {
        pgClose()
      }
      logger.info('End of cursor')
    })
  return stream
}

module.exports = {
  fetchDataStream
}
