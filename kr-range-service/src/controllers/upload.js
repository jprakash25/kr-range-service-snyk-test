const { logger } = require('../service/logger.service')
const { upload, deleteUploadTaggedDataInfo, updateUploadTaggedDataStatus } = require('../service/upload.service')
const ValidateTaggedDataService = require('../service/tagged-data-validaton.service')
const uploadTaggedData = upload.single('uploadTaggedData')

class UploadTaggedDataController {
  upload() {
    return async (req, res) => {
      await uploadTaggedData(req, res, async function (err) {
        if (err) {
          if (err.code) {
            logger.error(`Upload of tagged data failed: ${err.code}`)
            try {
              await deleteUploadTaggedDataInfo(req.body.info?.uid)
              logger.info('Delete of upload tagged data record successful')
              res.status(err.statusCode).json({ message: err.code })
            } catch (error) {
              res.status(400).json({ message: error.message })
            }
          } else {
            let error = JSON.parse(err)
            res.status(error.statusCode).json({ message: error.message })
          }
        } else {

          /*
            req.body.info will have key, bucket and uid details.
            Use the information to call validate tags endpoint.
            On success, update uploadTaggedDataInfo table row for the above uid with 'completed'
          */
          logger.info('Upload of tagged data successful', req.body.info)
          const { key, bucket, uid, clientSessionId, channel, username } = req.body.info
          const { associatedDepartments } = req
          await updateUploadTaggedDataStatus(uid, 'uploaded')
          res.status(201).json({ message: 'Upload successful' })
          ValidateTaggedDataService.parseAndValidate({ bucket, key, uid, clientSessionId, channel, associatedDepartments, username })
        }
      })
    }
  }
}

module.exports = new UploadTaggedDataController()
