/* eslint-env jest */
const AWSS3 = require('../../../../src/lib/aws/s3')
const AWS = require('aws-sdk')
const highland = require('highland')
const { PassThrough } = require('stream')
const { BufferWritableMock, BufferReadableMock, ReadableMock, WritableMock } = require('stream-mock')

const mockS3UploadObject = jest.fn()
jest.mock('aws-sdk')
let s3

const listObjectS3MockData = {
  Key: 'dss-archive-data/20181030025209894-D088Y18M04-000290.json',
  LastModified: '2020-09-17T09:07:38.000Z',
  ETag: '"373228bf8b0b681c4b8668fe68a8974d"',
  Size: 16596,
  StorageClass: 'STANDARD',
  Owner: {
    DisplayName: 'aws.kmaglobaldev',
    ID: '4d1ebc11ba1dddebe99a6c819dd5c821f70147355d84346604f4c2a12e5a1ad6'
  }
}

let listObjectMockData = {
  IsTruncated: true,
  marker: 'some-marker',
  Contents: [{
    ...listObjectS3MockData
  }]
}

const beforeEachFn = () => {
  jest.resetModules()
  AWS.S3 = jest.fn().mockImplementation(() => ({
    upload: mockS3UploadObject,
    getSignedUrl: (operation, params, cb) => {
      if (params.Bucket === 'error') {
        cb(new Error('error'))
        return
      } else {
        expect(operation).toEqual('getObject')
        expect(params.Bucket).toEqual('a')
        expect(params.Key).toEqual('b')
        expect(params.Expires).toEqual(100)
        cb(null, 'hello')
      }
    },
    listObjects: (operation, cb) => {
      cb(null, listObjectMockData)
    }
  }))
  s3 = new AWSS3({})
  mockS3UploadObject.mockImplementation((params) => {
    return {
      promise() {
        return Promise.resolve('test document')
      }
    }
  })
}


describe('Unit::AWS::S3', () => {
  beforeEach(() => {
    beforeEachFn()
  })

  describe('Unit::AWS::S3::upload', () => {
    it('should call upload function', async () => {
      expect(await s3.upload()).toEqual('test document')
    })
  })

  describe('Unit::AWS::S3::uploadStream', () => {
    beforeEach(() => {
      beforeEachFn()
    })

    it('should call uploadStream function', async () => {
      const testStream = await s3.uploadStream()
      expect(typeof testStream.writeStream).toEqual(typeof new PassThrough())
      expect(mockS3UploadObject).toHaveBeenCalledTimes(1)
    })
  })

  describe('Unit::AWS::S3::generateReadOnlySignedUrl', () => {
    beforeEach(() => {
      beforeEachFn()
    })

    it('should call generateReadOnlySignedUrl function', async () => {
      expect(await s3.generateReadOnlySignedUrl('a', 'b', 100)).toEqual('hello')
    })

    it('should call generateReadOnlySignedUrl function', async () => {
      try {
        await s3.generateReadOnlySignedUrl('error', 'b', 100)
      } catch (err) {
        expect(err.message).toEqual('error')
      }
    })
  })

  describe('Unit::AWS::S3::listObjectsToStream', () => {
    beforeEach(() => {
      beforeEachFn()
    })

    it.skip('should call listObjectsToStream', async (done) => {
      const stream = highland()
      const fakeWriteStream = new BufferWritableMock()
      s3.listObjectsToStream(stream, 'bucket-name', 'key-name', { marker: 'some-marker', limit: 10 })
      fakeWriteStream.on('finish', () => {
        expect(fakeWriteStream.data.toString()).toMatchSnapshot()
        done()
      })

      stream
        .flatMap(data => highland(data))
        .map(data => JSON.stringify(data))
        .pipe(fakeWriteStream)
    })
  })

})
