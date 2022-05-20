const { getCorsUrls } = require('./../../config/index')
const socketIo = require('socket.io')
const { logger } = require('../../service/logger.service')
class socketIoServer {
  io = null
  constructor() {
    logger.info('constructor of socketIoServer called')
  }
  init(httpServer) {
    this.io = socketIo(httpServer, {
      cors: {
        origin: getCorsUrls(),
        credentials: true,
        methods: ['GET', 'POST', 'OPTION'],
      },
      upgrade: false,
      allowEIO3: true,
      transports: ['websocket', 'polling'],
      path: '/rangeWS'
    })
    return this.io
  }
  sendToClient(id, data) {
    this.io.to(id).emit('message', JSON.stringify({ data: data }))
  }
  getClientList() {
    return this.io.sockets?.adapter?.sids?.keys() || []
  }
}

module.exports = new socketIoServer()
