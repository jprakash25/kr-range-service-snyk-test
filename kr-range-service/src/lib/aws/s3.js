const { PassThrough } = require('stream')
const AWS = require('aws-sdk')
class AWSS3 {

  SERVER_SIDE_ENCRYPTION = {
    ServerSideEncryption: 'AES256'
  }

  s3Instance = null
  constructor(params) {
    this.s3Instance = new AWS.S3({
      ...params,
      s3ForcePathStyle: true
    })
  }

  s3Params(Bucket, Key, Body) {
    return Object.assign({}, this.SERVER_SIDE_ENCRYPTION, {
      Bucket,
      Key,
      Body
    })
  }

  s3GetObject(bucket, key) {
    return this.s3Instance.getObject({
      Bucket: bucket,
      Key: key
    })
  }

  upload = async (bucket, key, readStream) => {
    const params = this.s3Params(bucket, key, readStream)
    // Use default options partSize = 5mb and queueSize = 4
    const options = {}
    return this.s3Instance.upload(params, options).promise()
  }

  uploadStream = (bucket, key) => {
    const pass = new PassThrough()
    const params = this.s3Params(bucket, key, pass)

    return {
      writeStream: pass,
      uploadCompletePromise: this.s3Instance.upload(params).promise()
    }
  }

  generateReadOnlySignedUrl(bucket, key, expiry) {
    const self = this
    const params = {
      Bucket: bucket,
      Key: key,
      Expires: +expiry
    }

    return new Promise((resolve, reject) => {
      self.s3Instance.getSignedUrl('getObject', params, (err, url) => {
        if (err) {
          reject(err)
        } else {
          resolve(url)
        }
      })
    })
  }

  s3GetObjectStream(bucket, key) {
    return this.s3Instance.getObject({
      Bucket: bucket,
      Key: key
    }).createReadStream()
  }

  putObject = (bucket, key, body) => {
    const params = this.s3Params(bucket, key, body)
    return this.s3Instance.putObject(params).promise()
  }
}

module.exports = AWSS3
