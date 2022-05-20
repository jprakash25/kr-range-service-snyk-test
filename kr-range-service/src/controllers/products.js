const { logger } = require('../service/logger.service')
const { deleteProductsBySourceId } = require('../service/products.service')
const { logSourceInfo } = require('../config')

class ProductsController {
  deleteProductsBySourceId() {
    return async (req, res) => {
      if (!req.params || !req.params.sourceid) {
        return res.status(500).send('Source ID is required')
      }

      logger.info({ sourceId: req.params.sourceid }, 'Received request to remove product')
      const deleteProducts = await deleteProductsBySourceId(req.params.sourceid)
      if (!deleteProducts) {
        logger.error({ sourceId: req.params.sourceid, ...logSourceInfo('CDS_DATA_PROCESSING') }, 'Failed request to remove product')
        return res.status(500).send('Error while deleting products by source ID')
      }

      if (deleteProducts.message) {
        logger.info({ sourceId: req.params.sourceid }, deleteProducts.message)
        return res.status(200).send(`${deleteProducts.message} ${req.params.sourceid}`)
      }

      logger.info({ sourceId: req.params.sourceid }, 'Completed request to remove product')
      return res.status(200).send(`Successfully deleted source ${req.params.sourceid}`)
    }
  }
}

module.exports = new ProductsController()
