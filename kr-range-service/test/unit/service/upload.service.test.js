/* eslint-env jest */
const { up } = require('../../../db/migrations/20210119101817-create-product-properties-table')
const uploadTaggedDataRepository = require('../../../src/lib/repositories/upload-tagged-data-info-repository')
const { initUpload, deleteUploadTaggedDataInfo, updateUploadTaggedDataStatus } = require('../../../src/service/upload.service')

jest.mock('../../../src/lib/repositories/upload-tagged-data-info-repository')

describe('Service:::Upload', () => {
  describe('Init Upload Method', () => {
    let data
    beforeEach(() => {
      data = {
        type: 'GM',
        channel: 'KHub',
        s3Data: {
          bucket: 'test',
          key: 'test'
        },
        username: 'testuser'
      }
    })

    it('should call createUploadTaggedDataInfo method', async () => {
      await initUpload(data)
      expect(uploadTaggedDataRepository.createUploadTaggedDataInfo).toBeCalledTimes(1)
    })

    it('should throw error when init upload method fails', async () => {
      uploadTaggedDataRepository.createUploadTaggedDataInfo.mockImplementation(() => {
        throw new Error('error')
      })
      await initUpload(data)
        .catch(e => {
          expect(e.message).toEqual('error')
        })
    })
  })

  describe('Delete upload tagged data info Method', () => {
    let uid = '5'

    it('should call deleteUploadTaggedDataInfoByUid method', async () => {
      await deleteUploadTaggedDataInfo(uid)
      expect(uploadTaggedDataRepository.deleteUploadTaggedDataInfoByUid).toBeCalledTimes(1)
    })

    it('should throw error when deleteUploadTaggedDataInfoByUid method fails', async () => {
      uploadTaggedDataRepository.deleteUploadTaggedDataInfoByUid.mockImplementation(() => {
        throw new Error(`Delete of upload tagged data info failed for uid: ${uid}`)
      })
      await deleteUploadTaggedDataInfo(uid)
        .catch(e => {
          expect(e.message).toEqual(`Delete of upload tagged data info failed for uid: ${uid}`)
        })
    })
  })

  describe('Update upload tagged data info Method', () => {
    let uid = '5'

    it('should call updateUploadTaggedDataInfo method', async () => {
      await updateUploadTaggedDataStatus(uid)
      expect(uploadTaggedDataRepository.updateUploadTaggedDataInfo).toBeCalledTimes(1)
    })

    it('should throw error when deleteUploadTaggedDataInfoByUid method fails', async () => {
      uploadTaggedDataRepository.updateUploadTaggedDataInfo.mockImplementation(() => {
        throw new Error(`Update of upload tagged data info failed for uid: ${uid}`)
      })
      await updateUploadTaggedDataStatus(uid)
        .catch(e => {
          expect(e.message).toEqual(`Update of upload tagged data info failed for uid: ${uid}`)
        })
    })
  })
})
