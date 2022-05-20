/* eslint-env jest */
const { sendMessageToCDSQueue } = require('../../../src/util/sendMessageToQueueHelper')
const { SQS } = require('../../../src/lib/aws')

jest.mock('../../../src/lib/aws')

describe('Send message to Queue Helper', () => {
  let res; let req = {}
  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    }
  })

  describe('Send Message to CDS Queue', () => {

    it('should return success if valid', async () => {
      await sendMessageToCDSQueue()(req, res)
      expect(SQS.sendMessage).toHaveBeenCalled()
    })

    it('should return error if send message fails', async () => {
      SQS.sendMessage.mockImplementation(() => {
        throw new Error(err)
      })
      await sendMessageToCDSQueue()(req, res)
      expect(SQS.sendMessage).toHaveBeenCalled()
    })

  })
})
