'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('product_info_v2', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      product_id: {
        allowNull: false,
        type: Sequelize.STRING
      },
      source_id: {
        allowNull: false,
        type: Sequelize.STRING
      },
      keycode_type: {
        allowNull: true,
        type: Sequelize.STRING
      },
      style_number: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      dss_item_number: {
        allowNull: true,
        type: Sequelize.STRING
      },
      primary_color: {
        allowNull: true,
        type: Sequelize.STRING
      },
      secondary_color: {
        allowNull: true,
        type: Sequelize.STRING
      },
      keycode: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      is_registered: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      product_data: {
        allowNull: false,
        type: Sequelize.JSONB
      },
      product_metadata: {
        allowNull: false,
        type: Sequelize.JSONB
      },
      type: {
        allowNull: false,
        type: Sequelize.ENUM,
        values: [
          'AP',
          'GM',
          'UK'
        ]
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })

    await queryInterface.addConstraint('product_info_v2', {
      type: 'unique',
      name: 'unique_product_info_v2_record_combination',
      fields: ['source_id', 'product_id']
    })

    await queryInterface.addIndex('product_info_v2', ['keycode'], {
      name: 'index_product_info_v2_keycode'
    })

    return await queryInterface.addIndex('product_info_v2', ['primary_color', 'secondary_color', 'style_number'], {
      name: 'index_product_info_v2_record_combination'
    })
  },

  down: async (queryInterface) => {
    await queryInterface.removeIndex('product_info_v2', 'index_product_info_v2_record_combination')
    await queryInterface.removeIndex('product_info_v2', 'index_product_info_v2_keycode')
    await queryInterface.removeConstraint('product_info_v2', 'unique_product_info_v2_record_combination')
    return queryInterface.dropTable('product_info_v2')
  }
}
