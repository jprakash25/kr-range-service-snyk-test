'use strict'

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.removeConstraint('properties', 'unique_property_name')
    return queryInterface.addConstraint('properties', {
      type: 'unique',
      name: 'unique_properties_record_combination',
      fields: ['name', 'type']
    })
  },

  down: async (queryInterface) => {
    await queryInterface.removeConstraint('properties', 'unique_properties_record_combination')
    return queryInterface.addConstraint('properties', {
      type: 'unique',
      name: 'unique_property_name',
      fields: ['name']
    })
  }
}
