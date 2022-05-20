exports.awsRegion = () => process.env.AWS_REGION || 'ap-southeast-2'

exports.getDefaultEndpoint = service => {
  const AWS_REGION = exports.awsRegion()

  // Please make to include 'https://' in the beginning and trailing slash '/' at the end when adding a new entry
  const defaultEndpoint = {
    Athena: `https://athena.${AWS_REGION}.amazonaws.com/`,
    CloudFormation: `https://cloudformation.${AWS_REGION}.amazonaws.com/`,
    DynamoDB: `https://dynamodb.${AWS_REGION}.amazonaws.com/`,
    Lambda: `https://lambda.${AWS_REGION}.amazonaws.com/`,
    KMS: `https://kms.${AWS_REGION}.amazonaws.com/`,
    S3: process.env.S3_ENDPOINT ? process.env.S3_ENDPOINT : `https://s3.${AWS_REGION}.amazonaws.com/`,
    SNS: `https://sns.${AWS_REGION}.amazonaws.com/`,
    SQS: process.env.SQS_ENDPOINT ? process.env.SQS_ENDPOINT : `https://sqs.${AWS_REGION}.amazonaws.com/`,
    SSM: `https://ssm.${AWS_REGION}.amazonaws.com/`,
    SimpleDB: `https://sdb.${AWS_REGION}.amazonaws.com/`,
    SecretsManager: `https://secretsmanager.${AWS_REGION}.amazonaws.com/`,
    Rekognition: `https://rekognition.${AWS_REGION}.amazonaws.com`,
    Glue: `https://glue.${AWS_REGION}.amazonaws.com`
  }

  return defaultEndpoint[service]
}
