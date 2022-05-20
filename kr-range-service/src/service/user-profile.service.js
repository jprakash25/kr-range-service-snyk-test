const { bulkCreateUserProfile, findLock, updateUserProfileDetails, getUserProfileDetails, getUserStateDetails } = require('../lib/repositories/user-profile-repository')
const { bulkCreateUserSocket } = require('../lib/repositories/user-socket-repository')
const { logger } = require('./logger.service')
const socketIOInstance = require('../lib/websocket')

const acquireReleaseLock = async ({ lock, type, username, displayName, clientId, associatedDepartments }) => {
  try {
    const isLockAcquire = lock?.toLowerCase() === 'acquire' ? true : false
    if (isLockAcquire) {
      let lockData = await lockState(type, associatedDepartments)
      if (lockData) {
        return lockData
      }
    }
    await updateUserProfileDetails({ hasLock: isLockAcquire }, username)
    let userProfileDetails = await getUserProfileDetails(type)
    let clientList = getClientList(userProfileDetails, associatedDepartments, type)
    for (let client of clientList) {
      if (client !== clientId) {
        socketIOInstance.sendToClient(client, {
          type: lock,
          status: 'success',
          info: { user: displayName, accessType: type }
        })
      }
    }
    return null
  } catch (err) {
    logger.error('Error while acquiring or releasing lock', err)
    throw new Error(err)
  }
}

const getClientList = (userProfileDetails, { departments, hasAllDepartmentAccess }, type) => {
  let filteredUserProfileDetails = userProfileDetails
  if (type === 'kmart' && !hasAllDepartmentAccess) {
    filteredUserProfileDetails = userProfileDetails.filter(data => {
      return (data.hasAllDeptAccess || data.departmentAccess.some(dept => departments.includes(dept)))
    })
  }
  let clientList = []
  filteredUserProfileDetails.map(userProfile => {
    userProfile.user_socket_details?.map(userSocket => {
      clientList.push(userSocket.socketId)
    })
  })
  return clientList
}

const lockState = async (type, associatedDepartments) => {
  try {
    let lockData = await findLock(type)
    if (type === 'kmart' && lockData?.length > 0) {
      lockData = validateLockStateForKmart(associatedDepartments, lockData)
    }
    return lockData?.[0]?.displayName
  } catch (err) {
    logger.error('Error while getting lock state', err)
    throw new Error(err)
  }
}

const validateLockStateForKmart = ({ hasAllDepartmentAccess, departments }, lockData) => {
  if (hasAllDepartmentAccess) {
    return lockData
  }
  lockData.sort((a, b) => (a.hasAllDeptAccess === b.hasAllDeptAccess) ? 0 : a.hasAllDeptAccess ? -1 : 1)
  let matchedLockData = lockData.find(data => {
    return (data.hasAllDeptAccess || data.departmentAccess.some(dept => departments.includes(dept)))
  })
  return [matchedLockData]
}

const updateUserProfile = async ({ associatedDepartments, type, displayName, username, clientId }) => {
  try {
    let userProfileModel = [{
      username: username,
      displayName: displayName,
      storeType: type,
      hasLock: false,
      hasAllDeptAccess: associatedDepartments?.hasAllDepartmentAccess || false,
      departmentAccess: associatedDepartments?.departments || [],
      createdAt: new Date(),
      updatedAt: new Date()
    }]
    await bulkCreateUserProfile(userProfileModel)
    let userSocketModel = [{
      username: username,
      socketId: clientId,
      createdAt: new Date(),
      updatedAt: new Date()
    }]
    return bulkCreateUserSocket(userSocketModel)
  } catch (err) {
    logger.error('Error while updating user profile', err)
    throw new Error('Error while updating user profile')
  }
}

const getUserState = async (username) => {
  try {
    let userData = await getUserStateDetails(username)
    if (!userData?.userState) {
      userData = {
        userState: {
          location: {
            country: true,
            climatic: true,
            state: true
          }
        }
      }
    }
    return userData?.userState
  } catch (err) {
    logger.error('Error while getting lock state', err)
    throw new Error(err)
  }
}

const updateUserStateDetails = async ({ username, userState }) => {
  try {
    return updateUserProfileDetails({ userState }, username)
  } catch (err) {
    logger.error('Error while updating user state', err)
    throw new Error(err)
  }
}

module.exports = {
  acquireReleaseLock,
  updateUserProfile,
  lockState,
  getUserState,
  updateUserStateDetails
}
