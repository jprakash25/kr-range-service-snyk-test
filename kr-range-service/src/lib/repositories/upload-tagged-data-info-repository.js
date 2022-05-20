const models = require('../models')

exports.createUploadTaggedDataInfo = async (data) => {
  const { upload_tagged_data_info } = models()
  return upload_tagged_data_info.create(data)
}

exports.deleteUploadTaggedDataInfoByUid = async (uid) => {
  const { upload_tagged_data_info } = models()
  const options = {
    where: {
      id: uid
    }
  }
  return upload_tagged_data_info.destroy(options)
}

exports.updateUploadTaggedDataInfo = async (uid, data) => {
  const { upload_tagged_data_info } = models()
  const options = {
    where: {
      id: uid
    },
    returning: true,
    plain: true
  }
  return upload_tagged_data_info.update(data, options)
}
