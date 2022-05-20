const { logger } = require('../service/logger.service')

const getOverrideConfigs = () => {
  const { PG_CONFIG } = process.env
  if (PG_CONFIG) {
    try {
      const { username, password, dbname, host } = JSON.parse(PG_CONFIG)
      return {
        username,
        password,
        database: dbname,
        host
      }
    } catch (err) {
      logger.error({ err }, 'Error parsing payload for DB connection')
      throw err
    }
  }

  return {}
}

const dbConfig = () => {
  try {
    const configOverride = getOverrideConfigs()
    const dbParams = {
      username: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
      host: process.env.PGHOST,
      dialect: 'postgres',
      logging: (msg) => logger.debug(msg),
      pool: {
        max: parseInt(process.env.PGPOOLSIZE) || 50
      }
    }

    if (process.env.PGPORT) {
      dbParams.port = process.env.PGPORT
    }

    return { ...dbParams, ...configOverride }
  } catch (err) {
    logger.error({ err }, 'Error loading DB connection configurations')
    throw err
  }
}

module.exports = dbConfig
