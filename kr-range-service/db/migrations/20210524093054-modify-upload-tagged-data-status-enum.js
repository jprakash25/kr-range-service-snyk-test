'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {

    await queryInterface.changeColumn('upload_tagged_data_info', 'status', {
      type: Sequelize.TEXT,
    })
    await queryInterface.sequelize.query('drop type enum_upload_tagged_data_info_status;')

    return queryInterface.changeColumn('upload_tagged_data_info', 'status', {
      allowNull: false,
      type: Sequelize.ENUM,
      values: ['uploaded', 'process', 'completed']
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('upload_tagged_data_info', 'status', {
      type: Sequelize.TEXT,
    })
    await queryInterface.sequelize.query('drop type enum_upload_tagged_data_info_status;')

    return queryInterface.changeColumn('upload_tagged_data_info', 'status', {
      allowNull: false,
      type: Sequelize.ENUM,
      values: ['process', 'completed']
    })
  }
}
