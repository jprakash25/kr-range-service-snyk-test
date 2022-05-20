const models = require('../models')

exports.upsertExportReport = async (data) => {
  const { export_reports } = models()
  return export_reports.upsert(data)
}

exports.getExportReportById = async (id) => {
  const { export_reports } = models()
  return export_reports.findOne({ where: { id }, raw: true })
}

exports.getExportReports = async (params) => {
  const { export_reports } = models()
  return export_reports.findAll(params)
}

exports.getExportReportsCount = async (params) => {
  const { export_reports } = models()
  return export_reports.count(params)
}
