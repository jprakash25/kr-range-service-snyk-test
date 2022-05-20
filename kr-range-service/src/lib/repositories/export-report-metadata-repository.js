const models = require('../models')

exports.upsertExportReportMetaData = async (data) => {
  const { export_report_metadata } = models()
  return export_report_metadata.upsert(data)
}
