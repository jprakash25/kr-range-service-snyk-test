
const AWS = require('aws-sdk')

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  logger: process.stdout
})

const createS3Bucket = (bucketName) => {
  const s3 = new AWS.S3({ endpoint: 'http://localhost:4566/' })
  const params = { Bucket: bucketName }
  return s3.createBucket(params).promise()
}

const createLocalQueue = (queueName) => {
  const sqs = new AWS.SQS({ endpoint: 'http://localhost:4566/' })
  const params = { QueueName: queueName }
  return sqs.createQueue(params).promise()
}

const setup = async () => {
  const {
    RANGE_INPUT_BUCKET_NAME,
    CDS_RANGE_SERVICE_INPUT_QUEUE,
    RANGE_OUTPUT_BUCKET_NAME,
    RANGE_INFO_BUCKET_NAME
  } = process.env

  try {
    await Promise.all([
      createS3Bucket(RANGE_INPUT_BUCKET_NAME),
      createS3Bucket(RANGE_OUTPUT_BUCKET_NAME),
      createS3Bucket(RANGE_INFO_BUCKET_NAME),
      createLocalQueue(CDS_RANGE_SERVICE_INPUT_QUEUE)
    ]).then(data => console.log(data))
  } catch (error) {
    console.error(error)
  }
}

setup()
  .catch((err) => { console.error('Could not setup localstack', err) })
