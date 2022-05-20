const { findBlacklistWhitelistKeys } = require('../repositories/upload-blacklist-whitelist-repository')
const moment = require('moment-timezone')
const { addDataErrorWithMoreSpecifiers } = require('./../validations/tagged-data-validator')
const { logger } = require('./../../service/logger.service')
const { propertiesMapping, getStoreFormatsOnChannel } = require('../../config/tagged-data')

const getWhiteBlacklistBasedon = (data, key) => data.filter((ele) => ele['basedOn'] === key)

const concatFTBasedOnKey = (data, key) => {
  let value = null
  switch (key && key.toLowerCase()) {
    case 'department':
      value = data.department
      break
    case 'family':
      value = `${data.department}${data.family}`
      break
    case 'class':
      value = `${data.department}${data.family}${data.class}`
      break
    case 'subclass':
      value = `${data.department}${data.family}${data.class}${data.subclass}`
      break
    case 'subsubclass':
      value = `${data.department}${data.family}${data.class}${data.subclass}${data.subsubclass}`
      break
    default:
      break
  }
  return value
}

const transformWhitelistBlacklistBasedonKey = (data, key) => (data.map((ele) => ({
  ...ele,
  concatFT: concatFTBasedOnKey(ele, key)
})))


// For Excel Upload
exports.checkIfProductsBlacklisted = (taggedProduct, blacklistData, errorList, passFailedRows) => {
  const blacklistWhitlelistkeys = findBlacklistWhitelistKeys()
  const { familyTree } = taggedProduct
  if (familyTree) {
    const productFT = {
      department: familyTree?.department?.code,
      family: familyTree?.family?.code,
      class: familyTree?.class?.code,
      subclass: familyTree?.subClass?.code,
      subsubclass: familyTree?.subSubClass?.code
    }
    /* Logic is to loop through all keys department,class,subclass,subsubclass and
     find if any of products/channel combo are blaclisted */
    return blacklistWhitlelistkeys.some((ele) => {
      const blackListedBasedon = getWhiteBlacklistBasedon(blacklistData, ele)
      const concatBlacklistData = transformWhitelistBlacklistBasedonKey(blackListedBasedon, ele)
      const concatProductFT = concatFTBasedOnKey(productFT, ele)
      return concatBlacklistData.some((blacklistItem) => {
        if (blacklistItem.concatFT === concatProductFT &&
          (taggedProduct[blacklistItem.channel] && taggedProduct[blacklistItem.channel].toUpperCase() === 'Y')) {
          if (moment().isBetween(blacklistItem.effectiveDate, blacklistItem.expiryDate)) {
            logger.info({ taggedProduct }, `product is blacklisted based on FT ${concatProductFT}`)
            errorList.push({
              ...taggedProduct,
              dataError: addDataErrorWithMoreSpecifiers(taggedProduct,
                `product should be excluded from tagging for channel ${blacklistItem.channel} since it belongs to familyTree ${concatProductFT}`)
            })
            passFailedRows.fail++
            return true
          } else {
            logger.info({ taggedProduct }, `product is not blacklisted based on FT ${concatProductFT}
            because its not between effective and expiry date`)
            return false
          }
        }
      })
    })
  }
}

// For UI grid
exports.getExclusions = ({ department_code, family_code, class_code, subclass_code, subSubClass_code }, blacklistData) => {
  const blacklistWhitlelistkeys = findBlacklistWhitelistKeys()
  let exclusions = { khub: {}, kmart: {} }
  const productFT = {
    department: department_code,
    family: family_code,
    class: class_code,
    subclass: subclass_code,
    subsubclass: subSubClass_code
  }
  /* Logic is to loop through all keys department,class,subclass,subsubclass and
   find if any of products/channel combo are blaclisted */
  blacklistWhitlelistkeys.some((ele) => {
    const blackListedBasedon = getWhiteBlacklistBasedon(blacklistData, ele)
    const concatBlacklistData = transformWhitelistBlacklistBasedonKey(blackListedBasedon, ele)
    const concatProductFT = concatFTBasedOnKey(productFT, ele)
    return concatBlacklistData.some((blacklistItem) => {
      if (blacklistItem.concatFT === concatProductFT) {
        exclusions = storeFormatExclusions(blacklistItem, exclusions)
      }
      return false
    })
  })
  return exclusions
}

const storeFormatExclusions = (blacklistItem, exclusions) => {
  if (getStoreFormatsOnChannel()['khub'].includes(blacklistItem.channel)) {
    exclusions.khub[propertiesMapping[blacklistItem.channel]] = {
      excluded: true,
      effectiveDate: blacklistItem.effectiveDate,
      expiryDate: blacklistItem.expiryDate
    }
  }
  if (getStoreFormatsOnChannel()['kmart'].includes(blacklistItem.channel)) {
    exclusions.kmart[propertiesMapping[blacklistItem.channel]] = {
      excluded: true,
      effectiveDate: blacklistItem.effectiveDate,
      expiryDate: blacklistItem.expiryDate
    }
  }
  return exclusions
}
