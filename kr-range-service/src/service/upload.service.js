const multer = require('multer')
const multerS3 = require('multer-s3')
const { rangeServiceInputsBucket } = require('../config')
const { S3 } = require('../lib/aws')
const { createUploadTaggedDataInfo, deleteUploadTaggedDataInfoByUid, updateUploadTaggedDataInfo } = require('../lib/repositories/upload-tagged-data-info-repository')
const { logger } = require('./logger.service')

const allowedTypes = ['AP', 'GM']

const initUpload = async (options) => {
  return createUploadTaggedDataInfo({
    type: options.type,
    channel: options.channel,
    startTime: new Date().getTime(),
    s3Data: {
      bucket: rangeServiceInputsBucket,
      key: options.s3key
    },
    status: 'uploaded',
    username: options.username
  })
}

exports.deleteUploadTaggedDataInfo = async (uid) => {
  try {
    return deleteUploadTaggedDataInfoByUid(uid)
  } catch (err) {
    logger.error(err, `Delete of upload tagged data info failed for uid: ${uid}`)
    throw new Error(`Delete of upload tagged data info failed for uid: ${uid}`)
  }
}

exports.updateUploadTaggedDataStatus = async (uid, status) => {
  return updateUploadTaggedDataInfo(uid, {
    endTime: new Date(),
    status: status
  })
}

const uploadTaggedData = multer({
  storage: multerS3({
    s3: S3.s3Instance,
    bucket: rangeServiceInputsBucket,
    key: async function (req, file, cb) {
      let type = (req.body.type ? req.body.type : '').toUpperCase()
      let clientSessionId = req.body.sessionId ? req.body.sessionId : ''
      let channel = req.body.channel ? req.body.channel : ''
      let username = req.user?.name
      if (!allowedTypes.some((uploadType) => uploadType === type) || !channel) {
        logger.error({ 'type': type, channel: channel }, 'Invalid request input ')
        cb(JSON.stringify({ statusCode: 400, message: 'Invalid request input' }))
      } else {
        const s3key = `uploads/${channel}/${type}/raw/tagged_data_${type}_${new Date().getTime()}.csv`
        const { dataValues } = await initUpload({ type, channel, s3key, username })
        const { id: uid } = dataValues
        req.body.info = {
          key: s3key,
          bucket: rangeServiceInputsBucket,
          uid: uid,
          clientSessionId,
          type,
          channel,
          username
        }
        cb(null, s3key)
      }
    }
  })
})

exports.upload = uploadTaggedData
exports.initUpload = initUpload
