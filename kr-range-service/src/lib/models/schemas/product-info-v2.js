const Sequelize = require('sequelize')

const ProductInfoV2 = (sequelize) =>
  sequelize.define(
    'product_info_v2',
    {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      productId: {
        allowNull: false,
        type: Sequelize.STRING,
        field: 'product_id',
        unique: 'unique_product_info_v2_record_combination'
      },
      sourceId: {
        allowNull: false,
        type: Sequelize.STRING,
        field: 'source_id',
        unique: 'unique_product_info_v2_record_combination'
      },
      keycodeType: {
        allowNull: true,
        type: Sequelize.STRING,
        field: 'keycode_type'
      },
      styleNumber: {
        allowNull: true,
        type: Sequelize.INTEGER,
        field: 'style_number'
      },
      dssItemNumber: {
        allowNull: true,
        type: Sequelize.STRING,
        field: 'dss_item_number',
      },
      primaryColor: {
        allowNull: true,
        type: Sequelize.STRING,
        field: 'primary_color'
      },
      secondaryColor: {
        allowNull: true,
        type: Sequelize.STRING,
        field: 'secondary_color'
      },
      keycode: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      isRegistered: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        field: 'is_registered'
      },
      productData: {
        allowNull: false,
        type: Sequelize.JSONB,
        field: 'product_data'
      },
      productMetadata: {
        allowNull: false,
        type: Sequelize.JSONB,
        field: 'product_metadata'
      },
      type: {
        allowNull: false,
        type: Sequelize.ENUM,
        values: ['AP', 'GM', 'UK'],
        field: 'type'
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        field: 'updated_at'
      },
      isValidProduct: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        field: 'is_valid_product'
      },
      exclusions: {
        allowNull: true,
        type: Sequelize.JSONB
      },
      description: {
        allowNull: true,
        type: Sequelize.STRING(1000)
      },
      statusCode: {
        allowNull: true,
        type: Sequelize.JSONB,
        field: 'status_code'
      },
      departmentCode: {
        allowNull: true,
        type: Sequelize.STRING,
        field: 'department_code'
      },
      year: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      season: {
        allowNull: true,
        type: Sequelize.STRING,
        field: 'season'
      },
      sellPrice: {
        allowNull: true,
        type: Sequelize.JSONB,
        field: 'sell_price'
      },
      fixtureType: {
        allowNull: true,
        type: Sequelize.STRING,
        field: 'fixture_type'
      },
      isDcReplenished: {
        allowNull: true,
        type: Sequelize.BOOLEAN,
        field: 'is_dc_replenished'
      },
      instorePresentation: {
        allowNull: true,
        type: Sequelize.STRING,
        field: 'instore_presentation'
      },
      replenishmentMethod: {
        allowNull: true,
        type: Sequelize.STRING,
        field: 'replenishment_method'
      },
      keycodes: {
        allowNull: true,
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        field: 'keycodes'
      },
      coreRangeDates: {
        allowNull: true,
        type: Sequelize.JSONB,
        field: 'core_range_dates'
      },
      createdOn: {
        allowNull: true,
        type: Sequelize.DATE,
        field: 'created_on'
      },
      family_id: {
        allowNull: false,
        type: Sequelize.BIGINT
      },
      familyName: {
        allowNull: true,
        type: Sequelize.STRING,
        field: 'family_name'
      },
      className: {
        allowNull: true,
        type: Sequelize.STRING,
        field: 'class_name'
      },
      subClassName: {
        allowNull: true,
        type: Sequelize.STRING,
        field: 'sub_class_name'
      },
      subSubClassName: {
        allowNull: true,
        type: Sequelize.STRING,
        field: 'sub_sub_class_name'
      },
      imageUrl: {
        allowNull: true,
        type: Sequelize.STRING,
        field: 'image_url'
      }
    },
    {
      indexes: [
        {
          name: 'index_product_info_v2_keycode',
          fields: ['keycode']
        },
        {
          name: 'index_product_info_v2_record_combination',
          fields: ['primary_color', 'secondary_color', 'style_number']
        },
        {
          name: 'index_product_info_v2_is_valid_product',
          fields: ['isValidProduct']
        },
        { name: 'index_product_info_v2_description', fields: ['description'] },
        {
          name: 'index_product_info_v2_department_code',
          fields: ['departmentCode']
        },
        {
          name: 'index_product_info_v2_year',
          fields: ['year']
        },
        {
          name: 'index_product_info_v2_season',
          fields: ['season']
        },
        {
          name: 'index_product_info_v2_dss_item_number',
          fields: ['dss_item_number']
        },
        {
          name: 'index_product_info_v2_createdOn',
          fields: ['createdOn']
        },
        {
          name: 'index_product_info_v2_family_name',
          fields: ['family_name']
        },
        {
          name: 'index_product_info_v2_class_name',
          fields: ['class_name']
        },
        {
          name: 'index_product_info_v2_subclass_name',
          fields: ['sub_class_name']
        }
      ],
      timestamps: false,
      underscored: true,
      freezeTableName: true
    }
  )

module.exports = ProductInfoV2
