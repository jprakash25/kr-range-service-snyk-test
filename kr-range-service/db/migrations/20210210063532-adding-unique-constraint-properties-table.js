'use strict'

module.exports = {
  up: async (queryInterface) => {
    return queryInterface.addConstraint('properties', {
      type: 'unique',
      name: 'unique_property_name',
      fields: ['name']
    })
  },
  down: async (queryInterface) => {
    return queryInterface.removeConstraint('properties',
      'unique_property_name')
  }
}
