const { logger } = require('./logger.service')
const config = require('../config')
const axios = require('axios')
const msal = require('@azure/msal-node')
const { getDepartmentsForRbus } = require('../util/rbu-department-mapping')
const adConfig = require('../config/activeDirectory')
const { getByUsername } = require('../lib/repositories/ad-test-data-repository')

const getTransitiveMemberOf = async (token, URL) => {
  try {
    const response = await axios.get(
      URL,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ConsistencyLevel': 'eventual',
        },
      }
    )
    return response.data.value
  } catch (error) {
    logger.error({ ...config.logSourceInfo('AD'), error }, 'Error while retrieving transitive member groups')
    return error
  }
}

const extractDepartmentsAndRbus = (associatedDepartmentAndRbuData) => {
  try {
    const departmentData = {
      rbu: [],
      department: [],
      hasAllDepartmentAccess: false
    }
    if (associatedDepartmentAndRbuData && associatedDepartmentAndRbuData.length > 0) {
      associatedDepartmentAndRbuData.forEach(value => {
        const splittedGroupName = value.displayName.split('-')
        if (splittedGroupName[1] == 'ALL') {
          departmentData.hasAllDepartmentAccess = true
        } else if (splittedGroupName[1] == 'RBU') {
          departmentData.rbu.push(splittedGroupName[2])
        } else if (splittedGroupName[1] == 'DEPARTMENT') {
          departmentData.department.push(splittedGroupName[2])
        }
      })
    }
    logger.debug({ departmentData }, 'Extracted department data')
    return departmentData
  } catch (error) {
    logger.error({ ...config.logSourceInfo('AD'), error }, 'Error while extracting associated departments')
    return null
  }
}

const getAssociatedDepartments = async (associatedDepartmentAndRbuData) => {
  const rbusAndDepartmentsData = extractDepartmentsAndRbus(associatedDepartmentAndRbuData)
  let departmentsUnderRbus = []
  if (rbusAndDepartmentsData?.hasAllDepartmentAccess) {
    return {
      hasAllDepartmentAccess: rbusAndDepartmentsData.hasAllDepartmentAccess,
      departments: [] // an empty array denotes user has access to all departments
    }
  }

  if (rbusAndDepartmentsData?.rbu && rbusAndDepartmentsData?.rbu.length > 0) {
    departmentsUnderRbus = await getDepartmentsForRbus(rbusAndDepartmentsData.rbu)
  }

  return {
    departments: [...rbusAndDepartmentsData?.department, ...departmentsUnderRbus].filter(Boolean)
  }

}

const getBearerTokenForExternalSystem = async (scope) => {
  const msalConfig = {
    auth: {
      clientId: config.adCredentials.clientID,
      authority: config.adCredentials.authority,
      clientSecret: config.adCredentials.clientSecret
    }
  }
  const pca = new msal.ConfidentialClientApplication(msalConfig)
  const param = {
    scopes: [scope],
    authority: config.adCredentials.authority
  }
  try {
    return pca.acquireTokenByClientCredential(param)

  } catch (err) {
    logger.error({ err, ...config.logSourceInfo('AD') }, 'Error while retreiving token for external system')
  }
}

const checkIfAccessIsRestricted = (userAssociatedRoles) => {
  const nonRestrictedGroups = [...adConfig.adGroups.khub]
  return !nonRestrictedGroups.some(grpId => userAssociatedRoles.includes(grpId))
}

const getADTestData = async (username) => {
  try {
    return getByUsername(username)
  } catch (err) {
    logger.error({ err, ...config.logSourceInfo('AD') }, 'Error while retreiving test data')
  }
}

module.exports = {
  getAssociatedDepartments,
  getTransitiveMemberOf,
  getBearerTokenForExternalSystem,
  checkIfAccessIsRestricted,
  getADTestData
}
