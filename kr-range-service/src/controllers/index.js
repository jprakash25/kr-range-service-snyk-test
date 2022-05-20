const healthcheck = require('./healthcheck')
const propertiesController = require('./properties')
const ProductExportController = require('./product-export')
const AuthorizationController = require('./authorization')
const UploadTaggedDataController = require('./upload')
const TaggedProductsController = require('./tagged-products')

module.exports = {
  healthcheck,
  propertiesController,
  ProductExportController,
  AuthorizationController,
  UploadTaggedDataController,
  TaggedProductsController
}
