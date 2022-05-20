const OIDCBearerStrategy = require('passport-azure-ad').BearerStrategy
const config = require('../../../config')
const { logger } = require('../../../service/logger.service')
const options = {
  // The URL of the metadata document for your app. We will put the keys for token validation from the URL found in the jwks_uri tag of the in the metadata.
  identityMetadata: config.adCredentials.identityMetadata,
  clientID: config.adCredentials.clientID,
  validateIssuer: config.adCredentials.validateIssuer,
  issuer: config.adCredentials.issuer,
  passReqToCallback: config.adCredentials.passReqToCallback,
  isB2C: config.adCredentials.isB2C,
  policyName: config.adCredentials.policyName,
  allowMultiAudiencesInToken: config.adCredentials.allowMultiAudiencesInToken,
  audience: config.adCredentials.audience,
  loggingLevel: config.adCredentials.loggingLevel,
}

if (config.adCredentials.proxyPort && config.adCredentials.proxyHost) {
  options.proxy = {
    port: config.adCredentials.proxyPort,
    host: config.adCredentials.proxyHost,
    protocol: 'http'
  }
}

class ADStrategy {
  getStrategy() {
    var bearerStrategy = new OIDCBearerStrategy(options,
      function (token, done) {
        logger.info('was the token retreived' + token)
        if (!token.oid)
          done(new Error('oid is not found in token'))
        else
          done(null, token)
      }
    )
    return bearerStrategy
  }
}

module.exports = new ADStrategy()
