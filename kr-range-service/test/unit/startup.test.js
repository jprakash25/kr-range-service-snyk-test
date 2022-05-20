const startUp = require('../../src/startup')
const { S3 } = require('../../src/lib/aws')
const fs = require('fs')
const path = require('path')
const ipmJobRepository = require('../../src/lib/repositories/ipm-job-info-repository')

jest.mock('../../src/lib/repositories/upload-blacklist-whitelist-repository')
jest.mock('../../src/lib/repositories/ipm-job-info-repository')
jest.mock('../../src/lib/aws')

describe('Start Up', () => {
  let bufferedData = fs.readFileSync(path.resolve(__dirname, '../fixtures/whitelist-blacklist.csv'))

  S3.s3GetObject.mockImplementation(() => {
    return {
      promise: jest.fn().mockResolvedValue({
        Body: bufferedData
      })
    }
  })

  ipmJobRepository.findProcessingJobs.mockImplementation(() => {
    return Promise.resolve([{ jobId: '1' }])
  })

  it('should load blacklist whitelist', async () => {
    let data = await startUp()
    expect(data).toEqual(undefined)
  })
})
