const userRoles = require('../config/user-roles')[process.env.ENVIRONMENT || 'dev']
const { logger } = require('../service/logger.service')
const axios = require('axios')
const conf = require('../config')
const querystring = require('querystring')
const { getTransitiveMemberOf, getAssociatedDepartments, checkIfAccessIsRestricted, getADTestData } = require('../service/active-directory.service')
class AuthorizationController {
  authorize() {
    return async (req, res, next) => {
      if (!req?.headers?.authorization) {
        logger.error('Authorization token does not exist')
        return res.status(401).json({ message: 'unauthorized' })
      }

      let silentToken = await this.getSilentToken(req.headers['authorization'])
      if (typeof silentToken !== 'string' && 'message' in silentToken) {
        logger.error(`Error in retrieving Graph API token ${JSON.stringify(silentToken)}`)
        return res.status(silentToken.response.status).json({ message: silentToken.message })
      }
      let userAssociatedRoles = await this.getUserGroups(silentToken)
      if (!Array.isArray(userAssociatedRoles) && 'message' in userAssociatedRoles) {
        logger.error(`Error in retrieving group information from Microsoft AD ${userAssociatedRoles}`)
        return res.status(userAssociatedRoles.response.status).json({ message: userAssociatedRoles.message })
      }
      let apiEndPoint = req.path
      if (req.params) {
        let keys = Object.keys(req.params)
        apiEndPoint = apiEndPoint.replace(req.params[keys[0]], `:${keys[0]}`)
      }
      const endpointGrpIds = userRoles[apiEndPoint].groups.map((grp) => grp.id)
      let isAllowed = endpointGrpIds.some(group => userAssociatedRoles.includes(group))
      logger.info(`API end point ${apiEndPoint} and isAllowed to access = ${isAllowed}`)
      if (!isAllowed) return res.status(401).json({ message: 'User is not allowed to access this end point' })
      else {
        const FTUrl = `${conf.adCredentials.graphAPITransitiveMemberURL}?$search="displayName:FT"&$select=displayName,id`
        const FTGroups = await getTransitiveMemberOf(silentToken, FTUrl)
        if (!Array.isArray(FTGroups) && 'message' in FTGroups) {
          logger.error(`Error in retrieving FT group information from Microsoft AD ${FTGroups}`)
          return res.status(FTGroups.response.status).json({ message: FTGroups.message })
        }
        let restrictedAccess
        let associatedDepartments
        if (process.env.ENVIRONMENT != 'prod') {
          let adTestData = await getADTestData(req?.user?.preferred_username?.toLowerCase())
          restrictedAccess = adTestData?.type === 'kmart'
          associatedDepartments = {
            hasAllDepartmentAccess: adTestData?.hasAllDeptAccess || false,
            departments: adTestData?.type === 'khub' ? [] : adTestData?.departmentAccess || ['036', '002']
          }
        } else {
          restrictedAccess = checkIfAccessIsRestricted(userAssociatedRoles)
          associatedDepartments = await getAssociatedDepartments(FTGroups)
        }
        if (!associatedDepartments) return res.status(401).json({ message: 'Some problem occured while fetching departments' })
        req.associatedDepartments = associatedDepartments
        req.restrictedAccess = restrictedAccess
        next()
      }
    }
  }

  getPostData() {
    return {
      client_id: conf.adCredentials.clientID,
      scope: conf.adCredentials.graphAPIScope,
      client_secret: conf.adCredentials.clientSecret,
      grant_type: conf.adCredentials.graphAPIGrantType,
      requested_token_use: 'on_behalf_of'
    }
  }

  async getSilentToken(token) {
    const postData = this.getPostData()
    postData.assertion = token.split(' ')[1]
    return this.getGraphAPIToken(postData)
  }

  async getUserGroups(token) {
    try {
      const response = await axios.post(conf.adCredentials.graphAPIURL,
        { 'securityEnabledOnly': true }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      return response.data.value
    } catch (error) {
      return error
    }
  }

  async getGraphAPIToken(postData) {
    try {
      const response = await axios.post(conf.adCredentials.graphAPITokenURL,
        querystring.stringify(postData), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      return response.data.access_token
    } catch (error) {
      return error
    }
  }
}

module.exports = new AuthorizationController()
