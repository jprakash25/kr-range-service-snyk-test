const express = require('express')
const cors = require('cors')
const routes = require('./routes')
const bodyParser = require('body-parser')
const { dbInitialize } = require('./db')
const {
  healthcheck
} = require('./controllers')
const expressOasGenerator = require('express-oas-generator')
const passport = require('passport')
const startUp = require('./startup')
const { getStrategy } = require('./lib/input-sources/strategy/active_directry_strategy')
const init = async () => {
  const app = express()
  expressOasGenerator.handleResponses(app, {})
  try {
    await dbInitialize() // Initializing DB on app startup
  } catch (e) {
    throw new Error(e)
  }
  app.use(cors()) // TODO: Change to allow specific cors
  app.use(bodyParser.json())
  app.use('/healthcheck', healthcheck.check())

  app.use(passport.initialize()) // Starts passport
  app.use(passport.session()) // Provides session support

  var bearerStrategy = getStrategy()
  passport.use(bearerStrategy)

  app.use('/range', routes)
  expressOasGenerator.handleRequests()
  await startUp()
  return app
}

module.exports.init = init
