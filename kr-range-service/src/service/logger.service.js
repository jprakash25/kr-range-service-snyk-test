const bunyan = require('bunyan')
const bunyanFormat = require('bunyan-format')

module.exports.logger = bunyan.createLogger({
  src: process.env.ENVIRONMENT !== 'prod',
  name: process.env.STACK_NAME || 'NO_STACK_NAME',
  level: process.env.LOG_LEVEL || 'info',
  serializers: bunyan.stdSerializers,
  stream: bunyanFormat({
    outputMode: 'bunyan',
    levelInString: true
  })
})
