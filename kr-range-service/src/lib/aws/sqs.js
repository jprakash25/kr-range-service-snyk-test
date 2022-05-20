const AWS = require('aws-sdk')

class AWSSQS {

  instance = null
  constructor(params) {
    this.instance = new AWS.SQS(params)
  }

  async sendMessage(QueueUrl, messageBodyObject) {
    const params = {
      QueueUrl,
      MessageBody: JSON.stringify(messageBodyObject)
    }

    return this.instance.sendMessage(params).promise()
  }
}

module.exports = AWSSQS
