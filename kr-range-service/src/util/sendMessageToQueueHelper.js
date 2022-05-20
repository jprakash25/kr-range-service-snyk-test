const config = require('../config')
const { SQS } = require('../lib/aws')

const sendMessageToCDSQueue = () => {
  return async (req, res) => {
    if (process.env.ENVIRONMENT != 'prod') {
      try {
        await SQS.sendMessage(config.coreDataServiceQueueURL, req.body)
        res.status(200).json({ Message: 'Data sent to CDS queue' })
      } catch (error) {
        res.status(400).json({ error })
      }
    } else {
      res.status(400).json({ Message: 'This API is only for lower env' })
    }
  }
}

module.exports = {
  sendMessageToCDSQueue
}
