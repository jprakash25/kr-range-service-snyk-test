/* eslint-env jest */
const aws = require('../../../../src/lib/aws')

describe('Unit::AWS Index', () => {
  it('S3 should be defined', () => {
    expect(aws.S3).toBeDefined()
  })
})
