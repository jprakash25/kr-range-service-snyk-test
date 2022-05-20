const Sequelize = require('sequelize')
const pg = require('pg')
const dbConfig = require('../config/database')
const { logger } = require('../service/logger.service')
let sequelizeInstance = null
let pgClient = null
let numberOfActiveConnections = 0

exports.dbInitialize = () => {
  if (!sequelizeInstance) {
    const config = dbConfig()
    sequelizeInstance = new Sequelize(config)
    sequelizeInstance.authenticate()
      .then(() => {
        console.log('DB connection is successful !!!')
      })
      .catch((err) => {
        throw new Error(err)
      })
  }
  return sequelizeInstance
}

exports.getDB = () => {
  if (!sequelizeInstance) { sequelizeInstance = exports.dbInitialize() }
  return sequelizeInstance
}

exports.pgConnect = async () => {
  if (!pgClient) {
    const { username, password, database, host, port } = dbConfig()
    const params = {
      user: username,
      host,
      database,
      password
    }

    if (port) params.port = port

    pgClient = new pg.Client(params)
    await pgClient.connect()
  }
  numberOfActiveConnections += 1
  logger.info({ 'Pg connections': numberOfActiveConnections }, 'Connecting instance')
  return pgClient
}

exports.pgClose = () => {
  numberOfActiveConnections -= 1
  logger.info({ 'Pg connections': numberOfActiveConnections }, 'disConnecting instance')
  if (pgClient && numberOfActiveConnections === 0) {
    pgClient.end()
    logger.info('Pg Instance ended')
    pgClient = null
  }
}

exports.closeDB = () => {
  if (sequelizeInstance) {
    sequelizeInstance.close()
  }

  sequelizeInstance = null
  return sequelizeInstance
}
