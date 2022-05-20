'use strict'

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addIndex('family', ['class_name'], {
      name: 'index_family_class_name'
    })
    await queryInterface.addIndex('family', ['subclass_name'], {
      name: 'index_family_subclass_name'
    })
    return queryInterface.addConstraint('family', {
      type: 'unique',
      name: 'unique_family',
      fields: ['department_code', 'family_code', 'class_code', 'subclass_code']
    })
  },
  down: async (queryInterface) => {
    await queryInterface.removeIndex('family', ['class_name'], {
      name: 'index_family_class_name'
    })
    await queryInterface.removeIndex('family', ['subclass_name'], {
      name: 'index_family_subclass_name'
    })
    return queryInterface.removeConstraint('family',
      'unique_family')
  }
}
