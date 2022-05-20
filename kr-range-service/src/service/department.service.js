const { getValidDepartmentData } = require('../lib/repositories/department-data-repository')
const { getDistinctYear } = require('../lib/repositories/product-info-v2-repository')
const { season } = require('../config/tagged-data')
const { logger } = require('./logger.service')
const { groupBy } = require('lodash')
const memoizee = require('memoizee')

let memoizedGetDepartmentData = memoizee(getValidDepartmentData, { maxAge: 24 * 60 * 60 * 1000, prefetch: 0.03 })
let memoizedGetDistinctYear = memoizee(getDistinctYear, { maxAge: 24 * 60 * 60 * 1000, prefetch: 0.03 })

const transformSubclassFilter = (data) => {
  let classGroup = groupBy(data, d => d.class_name)

  return Object.keys(classGroup).map((group) => {

    const classData = classGroup[group]

    return {
      class_name: group,
      class_id: `${classData[0]?.department_code},${classData[0]?.class_name}`,
      subclass_data: classData
    }
  })
}

const transformClassFilter = (data) => {
  let deptGroup = groupBy(data, d => d.department)

  return Object.keys(deptGroup).map((group) => {
    let deptData = group.split(' ')

    return {
      department: group,
      mappingId: deptData[0],
      class_data: transformSubclassFilter(deptGroup[group])
    }
  })
}

const transformDataToFilter = (data) => {
  let grouped = groupBy(data, d => d.rbu_code + '_' + d.rbu_name)

  return Object.keys(grouped).map((group) => {
    let rbuData = group.split('_')

    return {
      _id: rbuData[0],
      name: rbuData[1],
      data: transformClassFilter(grouped[group])
    }
  })
}

const filterByDepartment = (associatedDepartments, restrictedAccess, data) => {
  if (restrictedAccess && associatedDepartments?.departments?.length > 0) {
    data = data.filter(d => associatedDepartments?.departments?.includes(d.department_code))
  }
  return data
}

const getDepartmentFilters = async (params) => {
  try {
    const { associatedDepartments, restrictedAccess } = params
    let departmentData = await memoizedGetDepartmentData()
    if (!departmentData) {
      logger.info('Refetching department data')
      memoizedGetDepartmentData.clear()
      departmentData = await memoizedGetDepartmentData()
    }
    let rbu = filterByDepartment(associatedDepartments, restrictedAccess, departmentData)
    rbu = transformDataToFilter(rbu)
    let distinctYearData = await memoizedGetDistinctYear()
    if (!distinctYearData) {
      logger.info('Refetching distinct year')
      memoizedGetDepartmentData.clear()
      distinctYearData = await memoizedGetDistinctYear()
    }
    let year = distinctYearData.map(d => d.year).filter(Boolean).sort().reverse()
    return { rbu, year, season }
  } catch (err) {
    logger.error('Error while getting filters list', err)
    throw new Error('Error while getting filters list')
  }
}

module.exports = {
  getDepartmentFilters
}
