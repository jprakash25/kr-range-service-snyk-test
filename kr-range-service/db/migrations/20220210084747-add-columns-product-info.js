'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('product_info_v2', 'family_name', {
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('product_info_v2', 'class_name', {
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('product_info_v2', 'sub_class_name', {
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('product_info_v2', 'sub_sub_class_name', {
        type: Sequelize.STRING
      })
    ])

    return Promise.all([
      queryInterface.addIndex('product_info_v2', ['family_name'], {
        name: 'index_product_info_v2_family_name'
      }),
      queryInterface.addIndex('product_info_v2', ['class_name'], {
        name: 'index_product_info_v2_class_name'
      }),
      queryInterface.addIndex('product_info_v2', ['sub_class_name'], {
        name: 'index_product_info_v2_subclass_name'
      })
    ])
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.removeIndex('product_info_v2', ['family_name'], {
        name: 'index_product_info_v2_family_name'
      }),
      queryInterface.removeIndex('product_info_v2', ['class_name'], {
        name: 'index_product_info_v2_class_name'
      }),
      queryInterface.removeIndex('product_info_v2', ['sub_class_name'], {
        name: 'index_product_info_v2_subclass_name'
      })
    ])

    return Promise.all([
      queryInterface.removeColumn('product_info_v2', 'sub_sub_class_name', {
        type: Sequelize.STRING
      }),
      queryInterface.removeColumn('product_info_v2', 'sub_class_name', {
        type: Sequelize.STRING
      }),
      queryInterface.removeColumn('product_info_v2', 'class_name', {
        type: Sequelize.STRING
      }),
      queryInterface.removeColumn('product_info_v2', 'family_name', {
        type: Sequelize.STRING
      })
    ])
  }
}
