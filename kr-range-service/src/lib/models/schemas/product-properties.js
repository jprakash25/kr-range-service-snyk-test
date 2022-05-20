const Sequelize = require('sequelize')

const ProductProperties = sequelize => sequelize.define('product_properties', {
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
    unique: 'unique_product_id_property_id_source_id'
  },
  sourceId: {
    type: Sequelize.STRING,
    field: 'source_id',
    unique: 'unique_product_id_property_id_source_id'
  },
  propertyId: {
    allowNull: false,
    type: Sequelize.BIGINT,
    field: 'property_id',
    unique: 'unique_product_id_property_id_source_id'
  },
  propertyValue: {
    allowNull: false,
    type: Sequelize.STRING,
    field: 'property_value'
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

module.exports = ProductProperties
