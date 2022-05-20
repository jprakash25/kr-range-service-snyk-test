const request = require('supertest')
const { init } = require('../../src/app')
const { closeDB } = require('../../src/db')
const { S3 } = require('../../src/lib/aws')
const models = require('../../src/lib/models')
const { ProductExportController } = require('../../src/controllers')
const {
  upsertExportReport
} = require('../../src/lib/repositories/export-report-repository')
const { BufferWritableMock } = require('stream-mock')

jest.mock('../../src/lib/aws')

let app
const apiRequest = ({ url, method, data }) => {
  return request(app)[method](url)
    .send(data)
    .set('Accept', 'application/json')
  //.expect('Content-Type', /json/)
}

describe('Exports endpoints', () => {

  const model = models()
  afterEach(async () => {
    model.export_reports.destroy({ where: {}, truncate: true })
  })

  describe('Exports reports', () => {
    beforeEach(async () => {
      jest.resetModules()
      S3.generateReadOnlySignedUrl = jest.fn().mockResolvedValue('some-url')
      app = await init()
    })

    it('should require authorization', function (done) {
      apiRequest({ url: '/range/export/reports', method: 'get' })
        .expect(401)
        .end(function (err, res) {
          if (err) return done(err)
          done()
        })
    })

    it('should call exports/reports return empty response', (done) => {
      // apiRequest({ url: '/range/export/reports', method: 'get' })
      //   .expect(({ body }) => {
      //     expect(body.length).toBe(0)
      //   })
      //   .expect(200, done)
      let req = { query: {} }, res
      res = {
        status: function (resStatus) {
          return {
            json: function (resValue) {
              expect(resStatus).toBe(200)
              expect(resValue.length).toBe(0)
              done()
            }
          }
        }
      }
      ProductExportController.exportReports()(req, res)
    })

    it('should call exports/reports return one response', async (done) => {
      const data = { type: 'GM', startTime: "12345", endTime: "4321", status: 'completed' }
      await upsertExportReport(data)
      // apiRequest({ url: '/range/export/reports', method: 'get' })
      //   .expect(({ body }) => {
      //     expect(body).toEqual(expect.arrayContaining([expect.objectContaining(data)]))
      //   })
      //   .expect(200, done)

      let req = { query: {} }, res
      res = {
        status: function (resStatus) {
          return {
            json: function (resValue) {
              expect(resStatus).toBe(200)
              expect(resValue.length).toBe(1)
              expect(resValue).toEqual(expect.arrayContaining([expect.objectContaining(data)]))
              done()
            }
          }
        }
      }
      ProductExportController.exportReports()(req, res)
    })

    it('should call exports/:uid return wrong UID response', (done) => {
      // apiRequest({ url: '/range/export/reports/12345', method: 'get' })
      //   .expect(({ body }) => {
      //     expect(body).toEqual({ message: "Wrong UID" })
      //   })
      //   .expect(422, done)

      let req = { params: { uid: 12345 } }, res
      res = {
        status: function (resStatus) {
          return {
            json: function (resValue) {
              expect(resStatus).toBe(422)
              expect(resValue).toEqual({ message: 'Wrong UID' })
              done()
            }
          }
        }
      }
      ProductExportController.exportReportSingedUrl()(req, res)
    })

    it('should call exports/:uid return export in process response', async (done) => {
      const data = { type: 'GM', startTime: 12345, endTime: 4321, status: 'process' }
      const d = await upsertExportReport(data)
      const id = d[0].dataValues.id
      // apiRequest({ url: `/range/export/reports/${id}`, method: 'get' })
      //   .expect(({ body }) => {
      //     expect(body).toEqual({ message: "Export in process" })
      //   })
      //   .expect(200, done)
      let req = { params: { uid: id } }, res
      res = {
        status: function (resStatus) {
          return {
            json: function (resValue) {
              expect(resStatus).toBe(200)
              expect(resValue).toEqual({ message: 'Export in process' })
              done()
            }
          }
        }
      }
      ProductExportController.exportReportSingedUrl()(req, res)
    })

    it('should call exports/:uid return signedurl response', async (done) => {
      const data = { type: 'GM', startTime: 12345, endTime: 4321, status: 'completed', s3Data: { Bucket: 'bucket-name', Key: 'key' } }
      const d = await upsertExportReport(data)
      const id = d[0].dataValues.id
      // apiRequest({ url: `/range/export/reports/${id}`, method: 'get' })
      //   .expect(({ body }) => {
      //     expect(body).toEqual(expect.objectContaining({
      //       "endTime": "4321",
      //       "signedUrl": "some-url",
      //       "startTime": "12345"
      //     }))
      //   })
      //   .expect(200, done)
      let req = { params: { uid: id } }, res
      res = {
        status: function (resStatus) {
          return {
            json: function (resValue) {
              expect(resStatus).toBe(200)
              expect(resValue).toEqual(expect.objectContaining({
                "endTime": "4321",
                "signedUrl": "some-url",
                "startTime": "12345"
              }))
              done()
            }
          }
        }
      }
      ProductExportController.exportReportSingedUrl()(req, res)
    })
  })

  describe('Exports comment', () => {
    beforeEach(async () => {
      jest.resetModules()
      app = await init()
    })
    /*it('should update comment', async (done) => {
      const data = { type: 'GM', startTime: 12345, endTime: 4321, status: 'completed', s3Data: { Bucket: 'bucket-name', Key: 'key' } }
      const d = await upsertExportReport(data)
      const id = d[0].dataValues.id
      apiRequest({ url: `/range/export/${id}/comment`, method: 'put', data: { comment: 'test-comment' } })
        .end(() => {
          apiRequest({ url: `/range/export/reports/${id}`, method: 'get' })
            .expect(({ body }) => {
              console.log("body data received == " + JSON.stringify(body))
              expect(body.comment).toEqual('test-comment')
            })
            .expect(200, done)
        })
    })*/

    it('should not update comment', async (done) => {
      apiRequest({ url: `/range/export/12345/comment`, method: 'put' })
        .expect(({ body }) => {
          expect(body.message).toEqual('No comment in the body')
        })
        .expect(400, done)
    })

    it('should not update comment, wrong uid', async (done) => {
      apiRequest({ url: `/range/export/12345/comment`, method: 'put', data: { comment: 'test' } })
        .expect(({ body }) => {
          expect(body.message).toEqual('Wrong UID')
        })
        .expect(422, done)
    })
  })

  describe('Export', () => {
    beforeEach(async () => {
      jest.resetModules()
      const fakeWriteStream = new BufferWritableMock()
      S3.uploadStream = jest.fn(() => ({
        writeStream: fakeWriteStream,
        uploadCompletePromise: Promise.resolve({})
      }))

      S3.generateReadOnlySignedUrl = jest.fn().mockResolvedValue('some-url')
      app = await init()
    })

    it.skip('should call exports', (done) => {
      apiRequest({ url: '/range/export', method: 'post', data: { type: 'GM' } })
        .expect(({ body }) => {
          expect(body.status).toBe("process")
          expect(body.uid).toBeDefined()
        })
        .expect(201, done)
    })
  })
})
