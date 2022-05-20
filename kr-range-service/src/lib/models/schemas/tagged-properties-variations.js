const Sequelize = require('sequelize')

const TaggedPropertiesVariations = sequelize => sequelize.define('tagged_properties_variations', {
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
    unique: 'unique_variations_product_id_source_id'
  },
  sourceId: {
    type: Sequelize.STRING,
    field: 'source_id',
    unique: 'unique_variations_product_id_source_id'
  },
  hasCountryVariations: {
    allowNull: true,
    type: Sequelize.BOOLEAN,
    field: 'has_country_variations'
  },
  countryVariationsProperties: {
    allowNull: true,
    type: Sequelize.JSONB,
    field: 'country_variations_properties'
  },
  hasClimaticVariations: {
    allowNull: true,
    type: Sequelize.BOOLEAN,
    field: 'has_climatic_variations'
  },
  climaticVariationsProperties: {
    allowNull: true,
    type: Sequelize.JSONB,
    field: 'climatic_variations_properties'
  },
  hasStateVariations: {
    allowNull: true,
    type: Sequelize.BOOLEAN,
    field: 'has_state_variations'
  },
  stateVariationsProperties: {
    allowNull: true,
    type: Sequelize.JSONB,
    field: 'state_variations_properties'
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
  },
}, {
  indexes: [
    {
      name: 'unique_variations_product_id_source_id',
      fields: ['product_id', 'source_id'],
      unique: true
    }
  ],
  timestamps: false,
  underscored: true,
  freezeTableName: true
})

module.exports = TaggedPropertiesVariations
