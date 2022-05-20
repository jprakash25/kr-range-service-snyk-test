const express = require('express')
const router = express.Router()
const passport = require('passport')
const products = require('./controllers/products')
const { propertiesController, ProductExportController, UploadTaggedDataController,
  TaggedProductsController } = require('./controllers')
const { sendMessageToCDSQueue } = require('./util/sendMessageToQueueHelper')
const authorizationCtrl = require('./controllers/authorization')

router.get('/test', (req, res) => {
  return res.status(200).json({ message: 'From range service' })
})

router.delete('/products/:sourceid', products.deleteProductsBySourceId())

router.post('/export', passport.authenticate('oauth-bearer', {
  session: false
}), authorizationCtrl.authorize(), ProductExportController.export())

router.get('/export/reports', passport.authenticate('oauth-bearer', {
  session: false
}), authorizationCtrl.authorize(), ProductExportController.exportReports())

router.get('/export/reports/:uid', passport.authenticate('oauth-bearer', {
  session: false
}), authorizationCtrl.authorize(), ProductExportController.exportReportSingedUrl())
router.put('/export/:uid/comment', ProductExportController.exportPutComment())
router.post('/properties/bulkUpdate', propertiesController.bulkUpdateProperties())

router.post('/upload', passport.authenticate('oauth-bearer', {
  session: false
}), authorizationCtrl.authorize(), UploadTaggedDataController.upload())

router.post('/tagged-products', passport.authenticate('oauth-bearer', {
  session: false
}), authorizationCtrl.authorize(), TaggedProductsController.getTaggedProducts())

router.get('/productFilters', passport.authenticate('oauth-bearer', {
  session: false
}), authorizationCtrl.authorize(), TaggedProductsController.getProductFilters())

router.get('/triggerPublishChannelInfo', TaggedProductsController.taggedDataForExternalSystems())

router.post('/product/tag', passport.authenticate('oauth-bearer', {
  session: false
}), authorizationCtrl.authorize(), TaggedProductsController.updateTaggedData())

router.get('/periodList', passport.authenticate('oauth-bearer', {
  session: false
}), authorizationCtrl.authorize(), TaggedProductsController.getPeriodList())

router.get('/userAccessType', passport.authenticate('oauth-bearer', {
  session: false
}), authorizationCtrl.authorize(), TaggedProductsController.getUserAccessType())

router.post('/updateValidProduct', TaggedProductsController.updateValidProduct())

router.post('/lock/acquireOrRelease', passport.authenticate('oauth-bearer', {
  session: false
}), authorizationCtrl.authorize(), TaggedProductsController.acquireOrReleaseLock())

router.get('/lock/state', passport.authenticate('oauth-bearer', {
  session: false
}), authorizationCtrl.authorize(), TaggedProductsController.getLockState())

router.post('/updateUserSocketDetails', passport.authenticate('oauth-bearer', {
  session: false
}), authorizationCtrl.authorize(), TaggedProductsController.updateUserProfile())

router.delete('/deleteSocketDetails/:socketid', passport.authenticate('oauth-bearer', {
  session: false
}), authorizationCtrl.authorize(), TaggedProductsController.removeSocketId())

router.put('/updateUserState', passport.authenticate('oauth-bearer', {
  session: false
}), authorizationCtrl.authorize(), TaggedProductsController.updateUserState())

// for lower env
router.post('/sendDataToQueue', sendMessageToCDSQueue())

module.exports = router
