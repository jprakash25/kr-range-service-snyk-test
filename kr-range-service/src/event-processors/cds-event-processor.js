const { has } = require('lodash')
const { logger } = require('../service/logger.service')
const { S3 } = require('../lib/aws')
const { processCDSEvent } = require('../lib/input-sources/cds/event-processor')
const { logSourceInfo } = require('../config')

exports.handleMessage = async (sqsMessage) => {
  try {
    logger.info({ sqsMessage }, 'Received from core data service queue')
    const { Message } = JSON.parse(sqsMessage.Body)
    const parsedMsg = JSON.parse(Message)
    const { bucket, object } = parsedMsg.Records[0].s3
    if (bucket.name && object.key) {
      const s3EventData = await S3.s3GetObject(bucket.name, object.key).promise()
      const event = JSON.parse(Buffer.from(s3EventData.Body).toString())
      logger.info({ event }, 'Parsed event')
      const isInvalidEvent = has(event.metadata, 'excluded') && event.metadata.excluded ? true : false
      if(!isInvalidEvent){
        return processCDSEvent(event)
      }
      logger.error('Invalid Event')
    } else {
      logger.error(logSourceInfo('CDS_DATA_PROCESSING'),'Either bucket or key or both are not present in SQS message')
    }
  } catch (error) {
    logger.error({ error, ...logSourceInfo('CDS_DATA_PROCESSING') }, 'Error while processing message from core data service queue')
    throw new Error(error)
  }
}
