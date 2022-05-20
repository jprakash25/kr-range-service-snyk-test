const { rangeServiceInputsBucket } = require('../config')
const { logger } = require('../service/logger.service')
const { S3 } = require('../lib/aws')
const memoizee = require('memoizee')

const key = 'rbu/rbu_department_mappings.json'

const getRbuDepartmentMapping = async () => {
  const s3Data = await S3.s3GetObject(rangeServiceInputsBucket, key).promise()
  return JSON.parse(Buffer.from(s3Data.Body).toString())
}

/*
  1 day expiry
  prefetch default 33% of expiry time is left
*/
let memoizedGetRbuDepartmentMapping = memoizee(getRbuDepartmentMapping, { maxAge: 86400 * 1000, prefetch: true })

const getDepartmentsForRbus = async (rbuNumbers) => {
  let rbuDepartmentMapping = await memoizedGetRbuDepartmentMapping()
  if (!rbuDepartmentMapping) {
    logger.info('ReFetching RBU department mappings file')
    memoizedGetRbuDepartmentMapping.clear()
    rbuDepartmentMapping = await memoizedGetRbuDepartmentMapping()
  }

  return rbuNumbers.map(rbu => {
    const departmentsData = rbuDepartmentMapping[rbu] ? rbuDepartmentMapping[rbu].departments : null
    if(departmentsData) {
      return departmentsData.map(department => department.departmentNumber)
    }
  }).flat().filter(Boolean)
}

module.exports = {
  getDepartmentsForRbus
}
