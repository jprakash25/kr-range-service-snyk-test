/* eslint-disable no-fallthrough */
const http = require('http')
const { init } = require('./src/app')
const { logger } = require('./src/service/logger.service')
const pollers = require('./src/pollers/sqs')
const port = process.env.PORT || 3000
const socketIoServer = require('./src/lib/websocket')
const { deleteSocketId } = require('./src/service/user-socket.service')

init()
  .then((app) => {
    app.set('port', port)

    /**
     * Event listener for HTTP server "listening" event.
     */
    const onListening = () => {
      process.title = 'kr-range-service'
      const addr = server.address()
      const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`
      logger.info(`Listening on ${bind}`)

      if (process.env.ENABLE_POLLER === 'true') {
        pollers.startPollers()
      }
    }

    /**
     * Event listener for HTTP server "error" event.
     */
    const onError = (error) => {
      if (error.syscall !== 'listen') {
        throw error
      }

      const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`

      // handle specific listen errors with friendly messages
      switch (error.code) {
        case 'EACCES':
          console.error(`${bind} requires elevated privileges`)
          process.exit(1)
        case 'EADDRINUSE':
          console.error(`${bind} is already in use`)
          process.exit(1)
        default:
          throw error
      }
    }

    const server = http.createServer(app)
    server.listen(port)
    const io = socketIoServer.init(server)
    io.on('connection', (socket) => {
      logger.info(`socket connected socket id on ${socket.id}`)
      socket.send(JSON.stringify({ id: socket.id }))

      socket.on('disconnect', function () {
        deleteSocketId({ socketId: socket.id })
        logger.info(`disconnected socket client id ${socket.id}`)
      })
    })
    server.on('error', onError)
    server.on('listening', onListening)
  })
  .catch((err) => {
    logger.info({ err }, 'Error while starting the server')
  })
