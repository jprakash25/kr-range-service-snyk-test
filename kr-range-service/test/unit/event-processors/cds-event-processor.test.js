/* eslint-env jest */
const { processCDSEvent } = require('../../../src/lib/input-sources/cds/event-processor')
const { handleMessage } = require('../../../src/event-processors/cds-event-processor')
const { S3 } = require('../../../src/lib/aws')
const cds_input = require('../../fixtures/D001Y11M05-000794.json')

jest.mock('../../../src/lib/input-sources/cds/event-processor')
jest.mock('../../../src/lib/aws')

const s3Info = {
  Body: JSON.stringify({
    Message: JSON.stringify({
      Records: [{
        s3: {
          bucket: {
            name: 'test-bucket'
          },
          object: {
            key: 'test-key.json'
          }
        }
      }]
    })
  })
}

describe('Handle Message', () => {
  const input = JSON.parse(JSON.stringify(cds_input))
  beforeEach(() => {
    processCDSEvent.mockImplementation(jest.fn())
  })
  it('should return processed CDS event when event is valid', async () => {
    input.metadata.excluded = false
    S3.s3GetObject.mockImplementation(() => {
      return {
        promise: jest.fn().mockResolvedValue({
          Body: Buffer.from(JSON.stringify(input), 'utf8')
        })
      }
    })
    await handleMessage(s3Info)
    expect(processCDSEvent).toHaveBeenCalledTimes(1)
  })

  it('should not process CDS event when event is invalid', async () => {
    input.metadata.excluded = true
    S3.s3GetObject.mockImplementation(() => {
      return {
        promise: jest.fn().mockResolvedValue({
          Body: Buffer.from(JSON.stringify(input), 'utf8')
        })
      }
    })
    await handleMessage(s3Info)
    expect(processCDSEvent).toHaveBeenCalledTimes(0)
  })
})
