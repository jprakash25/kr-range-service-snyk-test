const { Consumer } = require('sqs-consumer')
const { logger } = require('../service/logger.service')
const { SQS } = require('../lib/aws')
const cdsHandler = require('../event-processors/cds-event-processor')

const getQueues = () => ([
  {
    queue: 'CDS_RANGE_SERVICE_QUEUE',
    url: process.env.CDS_RANGE_SERVICE_INPUT_QUEUE_URL,
    processor: cdsHandler,
    enable: true
  }
])

const createPoller = (queue, url, processor) => {
  logger.info('Starting', {
    poller: queue,
    queueUrl: url
  })

  const sqsConsumer = Consumer.create({
    queueUrl: url,
    handleMessage: processor.handleMessage,
    sqs: SQS.instance,
    batchSize: 1
  })

  sqsConsumer.on('error', (err) => {
    logger.debug(err, 'Sqs consumer error')
  })

  sqsConsumer.on('processing_error', (err) => {
    logger.debug(err, 'Sqs consumer processing error')
  })

  sqsConsumer.on('message_received', (message) => {
    logger.debug({ message }, 'Sqs consumer message_received')
  })

  sqsConsumer.on('message_processed', (message) => {
    logger.debug({ message }, 'Sqs message_processed')
  })

  return sqsConsumer
}

exports.startPollers = () => {
  getQueues()
    .filter(({ enable }) => enable)
    .map(({ queue, url, processor }) => createPoller(queue, url, processor))
    .forEach(poller => poller.start())
}
