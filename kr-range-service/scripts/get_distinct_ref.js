#!/usr/bin/env node
const highland = require('highland')
const fs = require('fs')
const { logger } = require('../src/service/logger.service')
const { S3 } = require('../src/lib/aws')
const { rangeServiceInputsBucket } = require('../src/config')
const { fetchDataStream } = require('../src/util/db_stream')

const main = async () => {
  let totalEvent = 0
  const sql = 'SELECT distinct source_id FROM product_info_v2;'
  const stream = await fetchDataStream(sql, true)

  const filename = `distinct-dss-ref-${Date.now()}.csv`
  const fileStream = fs.createWriteStream(`./${filename}`)

  highland(stream)
    .map(data => {
      totalEvent = totalEvent + 1
      return data
    })
    .map(data => {
      const dssRefNum = data.source_id
      fileStream.write(`${dssRefNum}\n`)
      return dssRefNum
    })
    .errors(errors => logger.error({ errors }, 'Error: send product info'))
    .done(async () => {
      logger.info({ totalEvent }, 'Transfering data is finished')
      logger.info({ bucket: rangeServiceInputsBucket, key: `core-data-service/${filename}` }, 'Publishing DSS ref number lists')
      S3.upload(rangeServiceInputsBucket, `core-data-service/${filename}`, fs.createReadStream(`./${filename}`))
    })
}

main()
