const moment = require('moment-timezone')

const getProductFilters = ({ type, associatedDepartments, filters, searchText }) => {
  let inputFilters = 'is_valid_product = true'

  if (Object.keys(filters)?.length > 0) {
    let { rbu_department_mapping, year, season } = filters
    if (rbu_department_mapping?.length > 0) {
      let department_code = new Set()
      let class_name = new Set()
      let subClass_name = new Set()
      rbu_department_mapping.map(rbu => {
        let family = rbu.split(',')
        if (family[0]) {
          department_code.add(family[0])
        }
        if (family[1]) {
          class_name.add(family[1])
        }
        if (family[2]) {
          subClass_name.add(family[2])
        }
      })
      if (department_code.size > 0) {
        inputFilters = `${inputFilters} AND department_code IN (${convertArrayToStringParams(Array.from(department_code))})`
      } else {
        inputFilters = addDepartmentFilters(type, associatedDepartments, inputFilters)
      }
      if (class_name.size > 0) {
        inputFilters = `${inputFilters} AND class_name IN (${convertArrayToStringParams(Array.from(class_name))})`
      }
      if (subClass_name.size > 0) {
        inputFilters = `${inputFilters} AND sub_class_name IN (${convertArrayToStringParams(Array.from(subClass_name))})`
      }
    }
    if (year?.length > 0) {
      inputFilters = `${inputFilters} AND year IN (${convertArrayToIntParams(year)}) `
    }
    if (season?.length > 0) {
      inputFilters = `${inputFilters} AND season IN (${convertArrayToStringParams(season)}) `
    }
  } else {
    inputFilters = addDepartmentFilters(type, associatedDepartments, inputFilters)
  }

  if (Object.keys(searchText)?.length > 0) {
    let { productCode, description, keycode } = searchText
    if (productCode) {
      inputFilters = `${inputFilters} AND dss_item_number ilike '%${productCode}%' `
    }
    if (description) {
      inputFilters = `${inputFilters} AND description ilike '%${description}%' `
    }
    if (keycode) {
      inputFilters = `${inputFilters} AND (keycode::text like '%${keycode}%' OR style_number::text like '%${keycode}%')`
    }
  }

  return inputFilters
}

const getDepartmentFilterQuery = ({ restrictedAccess, associatedDepartments }) => {
  let filterQuery = 'd."isValid" = True'

  if (restrictedAccess && associatedDepartments.departments.length > 0) {
    filterQuery = `${filterQuery} AND d.department_code IN (${convertArrayToStringParams(associatedDepartments?.departments)}) `
  }

  return filterQuery

}

const getYearList = (min, max) => {
  let yearList = []
  for (var i = max; i >= min; i--) {
    yearList.push(i)
  }
  return yearList
}

const getOnRangeFourWeeksLogic = () => {
  var mondayAfterFourWeeks = moment(new Date(), 'DD/MM/YYYY').add(4, 'weeks').startOf('isoweek')
  return mondayAfterFourWeeks.format('DD/MM/YYYY')
}

const getRangeDateOneWeekLogic = () => {
  var mondayAfterOneWeek = moment(new Date(), 'DD/MM/YYYY').add(1, 'week').startOf('isoweek')
  return mondayAfterOneWeek.format('DD/MM/YYYY')
}

const convertArrayToStringParams = (data) => {
  return data.map(c => `'${c}'`).join(', ')
}

const convertArrayToIntParams = (data) => {
  return data.map(c => `${c}`).join(', ')
}

const addDepartmentFilters = (type, associatedDepartments, inputFilters) => {
  if (!(type === 'khub' || associatedDepartments?.hasAllDepartmentAccess) && associatedDepartments?.departments?.length > 0) {
    inputFilters = `${inputFilters} AND department_code IN (${convertArrayToStringParams(associatedDepartments?.departments)}) `
  }
  return inputFilters
}

module.exports = {
  getProductFilters,
  getYearList,
  getOnRangeFourWeeksLogic,
  getDepartmentFilterQuery,
  convertArrayToStringParams,
  convertArrayToIntParams,
  getRangeDateOneWeekLogic
}
