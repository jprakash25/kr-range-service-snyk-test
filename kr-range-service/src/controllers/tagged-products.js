const { updateValidProductInfo } = require('../service/product-info.service')
const { saveTriggerInfo, getLastTriggeredTime } = require('../service/data-trigger-info.service')
const { extractData, saveTaggedData } = require('../service/tagging.service')
const { getDepartmentFilters } = require('../service/department.service')
const { getTaggedProducts } = require('../service/product-info.service')
const { extractPeriodList } = require('../service/period-calendar.service')
const { updateUserProfile, lockState, acquireReleaseLock, getUserState, updateUserStateDetails } = require('../service/user-profile.service')
const { deleteSocketId } = require('../service/user-socket.service')
const { logger } = require('../service/logger.service')
const { logSourceInfo } = require('../config')

class TaggedProductsController {

  getTaggedProducts() {
    return async (req, res) => {
      try {

        let { per_page: limit, offset, sort_data: sortData, filters, searchText } = req?.body

        limit = (limit) ? parseInt(limit) : 25
        let page = offset ? (parseInt(offset) / limit) + 1 : 1
        const { associatedDepartments, restrictedAccess } = req
        sortData = 'created_on DESC NULLS LAST'
        const type = restrictedAccess ? 'kmart' : 'khub'
        filters = filters || {}
        searchText = searchText || {}
        const { products, total } = await getTaggedProducts({ limit, page, type, associatedDepartments, sortData, filters, searchText })
        return res.status(200).json({
          data: products,
          page: page,
          total: total
        })
      } catch (error) {
        logger.error({ error, ...logSourceInfo('TAGGING') }, 'Error while fetching tagged products')
        return res.status(400).json({ message: error })
      }
    }
  }

  getProductFilters() {
    return async (req, res) => {
      try {
        const { associatedDepartments, restrictedAccess } = req
        const filters = await getDepartmentFilters({ associatedDepartments, restrictedAccess })
        return res.status(200).json(filters)
      } catch (error) {
        logger.error({ error, ...logSourceInfo('TAGGING') }, 'Error while fetching filters')
        return res.status(400).json({ message: error })
      }
    }
  }

  getUserAccessType() {
    return async (req, res) => {
      try {
        const { restrictedAccess, user } = req
        const userState = await getUserState(user?.preferred_username)
        return res.status(200).json({ type: restrictedAccess ? 'kmart' : 'khub', userState })
      } catch (error) {
        logger.error({ error, ...logSourceInfo('TAGGING') }, 'Error while fetching user access type')
        return res.status(400).json({ message: error })
      }
    }
  }

  taggedDataForExternalSystems() {
    return async (req, res) => {
      try {
        const triggeredBy = req?.query?.name || 'lambda'
        const lastTriggerTime = await getLastTriggeredTime({ triggeredBy, type: 'khub' })
        logger.info({ lastTriggerTime }, 'Last trigger time')
        await saveTriggerInfo({ triggeredBy, type: 'khub' })
        const data = await extractData(lastTriggerTime?.khubTriggerTime)
        res.status(200).json({ message: data })
      } catch (error) {
        logger.error({ error, ...logSourceInfo('EXTERNAL_TRIGGER') }, 'Error while triggering tagged data for external systems')
      }
    }
  }

  updateTaggedData() {
    return async (req, res) => {
      try {
        const products = req?.body?.products
        const type = req?.body?.type
        const username = req?.user?.name
        if (products?.length > 0) {
          await saveTaggedData({ products, type, username })
          return res.status(200).json({ message: 'Products tagged successfully' })
        } else {
          return res.status(400).json({ message: 'No products to update' })
        }
      } catch (error) {
        logger.error({ error, ...logSourceInfo('TAGGING') }, 'Error while updating tagged data')
        return res.status(400).json({ message: error })
      }
    }
  }

  getPeriodList() {
    return async (req, res) => {
      try {
        const periodList = await extractPeriodList()
        return res.status(200).json(periodList)
      } catch (error) {
        logger.error({ error, ...logSourceInfo('TAGGING') }, 'Error while fetching period list')
        return res.status(400).json({ message: error })
      }
    }
  }

  updateValidProduct() {
    return async (req, res) => {
      try {
        logger.info('Update of validProduct info started')
        await updateValidProductInfo()
        res.status(200).json({ message: 'Update of validProduct info started' })
      } catch (error) {
        logger.error({ error, ...logSourceInfo('TAGGING') }, 'Error while updating isValidProduct field')
      }
    }
  }

  acquireOrReleaseLock() {
    return async (req, res) => {
      try {
        const { associatedDepartments, user, body, restrictedAccess } = req
        const lock = body?.lock
        const clientId = body?.clientId
        const type = body?.type || (restrictedAccess ? 'kmart' : 'khub')
        if (!lock) {
          return res.status(400).json({ message: 'lock is required' })
        }
        const lockedUser = await acquireReleaseLock({ lock, type, username: user?.preferred_username, displayName: user?.name, clientId, associatedDepartments })
        if (!lockedUser) {
          logger.info('Lock is acquired/release successfully')
          res.status(200).json({ message: 'Lock acquired/released successfully', locked: false })
        } else {
          logger.info(`Lock is acquired by another user: ${lockedUser}`)
          res.status(200).json({ message: lockedUser, locked: true })
        }
      } catch (error) {
        logger.error({ error, ...logSourceInfo('TAGGING') }, 'Error while acquiring/releasing lock')
        res.status(400).json({ message: error })
      }
    }
  }

  getLockState() {
    return async (req, res) => {
      try {
        const { associatedDepartments, restrictedAccess } = req
        const type = req?.query?.type || (restrictedAccess ? 'kmart' : 'khub')
        const lockedUser = await lockState(type, associatedDepartments)
        if (!lockedUser) {
          logger.info('Lock is not acquired by any other user')
          res.status(200).json({ message: 'Lock is not acquired', locked: false })
        } else {
          logger.info(`Lock is acquired by another user: ${lockedUser}`)
          res.status(200).json({ message: lockedUser, locked: true })
        }
      } catch (error) {
        logger.error({ error, ...logSourceInfo('TAGGING') }, 'Error while getting state of lock')
        res.status(500).json({ message: error })
      }
    }
  }

  updateUserProfile() {
    return async (req, res) => {
      try {
        const { associatedDepartments, restrictedAccess, user, body } = req
        const type = restrictedAccess ? 'kmart' : 'khub'
        const clientId = body?.clientId
        if (!clientId) {
          return res.status(400).json({ message: 'Client Id is required' })
        }
        await updateUserProfile({ associatedDepartments, type, username: user?.preferred_username, displayName: user?.name, clientId })
        res.status(200).json({ message: 'Successfully updated user profile details' })
      } catch (error) {
        logger.error({ error, ...logSourceInfo('TAGGING') }, 'Error while updating user profile')
        res.status(500).json({ message: error })
      }
    }
  }

  updateUserState() {
    return async (req, res) => {
      try {
        const { user, body } = req
        const userState = body?.userState
        if (!userState) {
          return res.status(400).json({ message: 'User State is required' })
        }
        await updateUserStateDetails({ username: user?.preferred_username, userState })
        res.status(200).json({ message: 'Successfully updated user state details' })
      } catch (error) {
        logger.error({ error, ...logSourceInfo('TAGGING') }, 'Error while updating user state')
        res.status(500).json({ message: error })
      }
    }
  }

  removeSocketId() {
    return async (req, res) => {
      const socketId = req.params?.socketid
      try {
        if (!socketId) {
          return res.status(400).send('Socket ID required')
        }
        await deleteSocketId({ socketId, username: req?.user?.preferred_username })
        res.status(200).json({ message: 'Socket ID successfully removed' })
      } catch (err) {
        logger.error({ socketId, ...logSourceInfo('TAGGING') }, 'Failed request to remove socketID')
        res.status(500).json({ message: err })
      }
    }
  }
}

module.exports = new TaggedProductsController()
