/* eslint-env jest */
const { ObjectReadableMock } = require('stream-mock')
const validateTaggedDataService = require('../../../src/service/tagged-data-validaton.service')
const { S3 } = require('../../../src/lib/aws')
const socketIoServer = require('../../../src/lib/websocket')
jest.mock('../../../src/lib/websocket')
jest.mock('../../../src/lib/aws')

describe('parse and validate tagged data', () => {
  beforeEach(() => {
    let writeStream = jest.fn()
    S3.uploadStream = jest.fn().mockReturnValue({
      writeStream,
      uploadCompletePromise: Promise.resolve('done')
    })
  })
  it('should return false, because of tagged file contains wrong columns', async () => {
    const stream = new ObjectReadableMock('a,b\na1,b1\na2,b2')
    S3.s3GetObjectStream = jest.fn().mockReturnValue(stream)
    const result = await validateTaggedDataService.parseAndValidate({
      bucket: 'test', key: 'testkey',
      uid: '123', clientSessionId: 'abc123', channel: 'khub'
    })
    expect(result).toBe(false)
    expect(stream.destroyed).toBe(true)
  })
})
