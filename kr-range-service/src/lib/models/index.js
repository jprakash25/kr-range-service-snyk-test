const Sequelize = require('sequelize')
const db = require('../../db')
const {
  Properties,
  ProductProperties, ExportReport, ExportReportMetadata, PeriodCalendar,
  UploadTaggedDataInfo, ProductInfoV2, UploadBlackListWhiteList, KmartProductProperties,
  Family, Department, UserProfile, UserSocketDetails, IpmJobInfo, DataTriggerInfo, ADTestData, TaggedPropertiesVariations
} = require('./schemas')

let models = null

module.exports = () => {
  if (models) { return models }

  const sequelizeInstance = db.getDB()
  Properties(sequelizeInstance, Sequelize.DataTypes)
  ProductProperties(sequelizeInstance, Sequelize.DataTypes)
  ExportReport(sequelizeInstance, Sequelize.DataTypes)
  ExportReportMetadata(sequelizeInstance, Sequelize.DataTypes)
  PeriodCalendar(sequelizeInstance, Sequelize.DataTypes)
  UploadTaggedDataInfo(sequelizeInstance, Sequelize.DataTypes)
  ProductInfoV2(sequelizeInstance, Sequelize.DataTypes)
  UploadBlackListWhiteList(sequelizeInstance, Sequelize.DataTypes)
  KmartProductProperties(sequelizeInstance, Sequelize.DataTypes)
  Department(sequelizeInstance, Sequelize.DataTypes)
  Family(sequelizeInstance, Sequelize.DataTypes)
  IpmJobInfo(sequelizeInstance, Sequelize.DataTypes)
  DataTriggerInfo(sequelizeInstance, Sequelize.DataTypes)
  UserProfile(sequelizeInstance, Sequelize.DataTypes)
  UserSocketDetails(sequelizeInstance, Sequelize.DataTypes)
  ADTestData(sequelizeInstance, Sequelize.DataTypes)
  TaggedPropertiesVariations(sequelizeInstance, Sequelize.DataTypes)
  models = sequelizeInstance.models
  return models
}
