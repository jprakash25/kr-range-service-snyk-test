const AWSSQS = require('./sqs')
const AWSS3 = require('./s3')
const AWS = require('aws-sdk')
const url = require('url')
const proxy = require('https-proxy-agent')
const { getDefaultEndpoint, awsRegion } = require('./endpoint')

if (process.env.HTTPS_PROXY) {
  const proxyUrl = new url.URL('/', process.env.HTTPS_PROXY)
  AWS.config.update({
    httpOptions: {
      agent: proxy({
        host: proxyUrl.host,
        port: proxyUrl.port,
        path: proxyUrl.pathname,
        href: proxyUrl.href,
        protocol: proxyUrl.protocol,
        hostname: proxyUrl.hostname,
        hash: proxyUrl.hash,
        search: proxyUrl.search,
        query: proxyUrl.query || {},
        timeout: 120000
      })
    }
  })

}

const defaultParams = (service) => ({
  apiVersion: 'latest',
  region: awsRegion(), // if not set, default to sydney region
  endpoint: new AWS.Endpoint(getDefaultEndpoint(service))
})

const S3 = new AWSS3(defaultParams('S3'))
const SQS = new AWSSQS(defaultParams('SQS'))

module.exports = {
  SQS,
  S3
}
