/* eslint-env jest */
const db = require('../../src/db')

const tablesToClean = [
  'export_report_metadata',
  'export_reports',
  'product_info',
  'product_properties',
  'properties',
  'product_info_v2',
  'family',
  'department',
  'data_trigger_info',
  'ipm_job_info',
  'kmart_product_properties',
  'tagged_properties_variations',
  'user_socket_details',
  'user_profile',
  'period_calendar'
]

const dbCleanUp = () =>
  Promise.all(tablesToClean.map(
    table => db.getDB().query(`TRUNCATE TABLE ${table} RESTART IDENTITY;`)
  ))

beforeAll(() => {
  console.log('beforeAll - initialize sequelize')
  db.dbInitialize()
})

beforeEach(async () => {
  console.log('beforeEach - truncate dbs')
  await dbCleanUp()
})

afterAll(async () => {
  console.log('afterAll - shutdown sequelize')
  await db.closeDB()
})
