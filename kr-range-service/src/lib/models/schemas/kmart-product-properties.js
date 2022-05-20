const Sequelize = require('sequelize')

const KmartProductProperties = sequelize => sequelize.define('kmart_product_properties', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: Sequelize.BIGINT
  },
  productId: {
    allowNull: false,
    type: Sequelize.STRING,
    field: 'product_id',
    unique: 'unique_product_id_source_id'
  },
  sourceId: {
    type: Sequelize.STRING,
    field: 'source_id',
    unique: 'unique_product_id_source_id'
  },
  coreOnRangeDate: {
    allowNull: true,
    type: Sequelize.STRING,
    field: 'core_on_range_date'
  },
  coreOffRangeDate: {
    allowNull: true,
    type: Sequelize.STRING,
    field: 'core_off_range_date'
  },
  coreOnRangePeriod: {
    allowNull: true,
    type: Sequelize.STRING,
    field: 'core_on_range_period'
  },
  coreOffRangePeriod: {
    allowNull: true,
    type: Sequelize.STRING,
    field: 'core_off_range_period'
  },
  planC: {
    allowNull: true,
    type: Sequelize.STRING,
    field: 'plan_c'
  },
  nonPlanC: {
    allowNull: true,
    type: Sequelize.STRING,
    field: 'non_plan_c'
  },
  smallFleet: {
    allowNull: true,
    type: Sequelize.STRING,
    field: 'small_fleet'
  },
  onlineOnly: {
    allowNull: true,
    type: Sequelize.STRING,
    field: 'online_only'
  },
  aws: {
    allowNull: true,
    type: Sequelize.INTEGER
  },
  lspl: {
    allowNull: true,
    type: Sequelize.INTEGER
  },
  username: {
    allowNull: true,
    type: Sequelize.STRING
  },
  createdAt: {
    allowNull: false,
    type: Sequelize.DATE,
    field: 'created_at'
  },
  updatedAt: {
    allowNull: false,
    type: Sequelize.DATE,
    field: 'updated_at'
  }
}, {
  timestamps: false,
  underscored: true,
  freezeTableName: true
})

module.exports = KmartProductProperties
