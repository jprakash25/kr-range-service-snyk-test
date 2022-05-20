module.exports = {
  rangeServiceInputsBucket: process.env.RANGE_INPUT_BUCKET_NAME,
  cdsRangeServiceInputQueueURL: process.env.CDS_RANGE_SERVICE_INPUT_QUEUE_URL,
  rangeServiceInfoBucket: process.env.RANGE_INFO_BUCKET_NAME,
  ipmUrl: process.env.IPM_URL,
  productServiceUrl: process.env.PRODUCT_SERVICE_URL,
  ipmJobStatusPollInterval: process.env.IPM_JOB_STATUS_POLL_INTERVAL,
  periodCalendarFilePath: 'src/data/period_calendar.csv',
  familyTreePath: '../src/data/family_tree.csv',
  errorSources: {
    CDS_DATA_PROCESSING: 'cds_data_processing',
    EXPORT: 'export',
    TAGGING: 'tagging',
    DB: 'database',
    EXTERNAL_TRIGGER: 'external_trigger',
    OTHERS: 'others'
  },
  adCredentials: {
    // Requried
    //identityMetadata: 'https://login.microsoftonline.com/81311c1e-0e29-420f-96e1-f5ea8bbfdedd/v2.0/.well-known/openid-configuration',
    identityMetadata: `https://login.microsoftonline.com/${process.env.AD_TENANT_ID}/v2.0/.well-known/openid-configuration`,
    //identityMetadata: `https://login.microsoftonline.com/cba8ca03-8b95-448d-b259-98a44d112f7c/v2.0/.well-known/openid-configuration`,

    // or 'https://login.microsoftonline.com/<your_tenant_guid>/v2.0/.well-known/openid-configuration'
    // or you can use the common endpoint
    // 'https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration'
    authority: `https://login.microsoftonline.com/${process.env.AD_TENANT_ID}/`,
    // Required
    //clientID: '8949afe6-f7ca-4402-af0a-b1205712b4c3',
    clientID: `${process.env.AD_CLIENT_ID}`,
    //clientID: '4a7c3ad6-1759-45f5-93c5-ee9a5608a6df',
    // Required.
    // If you are using the common endpoint, you should either set `validateIssuer` to false, or provide a value for `issuer`.
    validateIssuer: false,

    // Required.
    // Set to true if you use `function(req, token, done)` as the verify callback.
    // Set to false if you use `function(req, token)` as the verify callback.
    passReqToCallback: false,

    // Required if you are using common endpoint and setting `validateIssuer` to true.
    // For tenant-specific endpoint, this field is optional, we will use the issuer from the metadata by default.
    issuer: null,

    // Optional, default value is clientID
    // audience: null,

    // Optional. Default value is false.
    // Set to true if you accept access_token whose `aud` claim contains multiple values.
    allowMultiAudiencesInToken: false,

    // Optional. 'error', 'warn' or 'info'
    loggingLevel: 'info',
    //use this flag for more logs from AD
    loggingNoPII: true,

    graphAPITokenURL: `https://login.microsoftonline.com/${process.env.AD_TENANT_ID}/oauth2/v2.0/token`,

    graphAPIURL: 'https://graph.microsoft.com/v1.0/me/getMemberGroups',

    graphAPIScope: 'https://graph.microsoft.com/GroupMember.Read.All',

    graphAPIGrantType: 'urn:ietf:params:oauth:grant-type:jwt-bearer',

    graphAPITransitiveMemberURL: 'https://graph.microsoft.com/v1.0/me/transitiveMemberOf',

    testGroupId: 'e984e582-382c-476d-b50b-6aa700c51bbd',

    clientSecret: `${process.env.AD_CLIENT_SECRET}`,

    proxyHost: process.env.PROXY_HOST ? process.env.PROXY_HOST : null,

    proxyPort: process.env.PROXY_PORT ? process.env.PROXY_PORT : null,

    ipmClientId: `${process.env.IPM_CLIENT_ID}`,

    productServiceClientId: `${process.env.PRODUCT_SERVICE_CLIENT_ID}`

  },
  logSourceInfo: (sourceName = '') => {
    const sources = {
      CDS_DATA_PROCESSING: 'cds_data_processing',
      EXPORT: 'export',
      TAGGING: 'tagging',
      AD: 'active directory',
      DB: 'database',
      EXTERNAL_TRIGGER: 'external_trigger',
      OTHERS: 'others'
    }
    return {
      source: sources[sourceName] ? sources[sourceName] : 'unknown source'
    }
  },
  getCorsUrls: () => process.env.CORS_URLS && process.env.CORS_URLS.length > 0 ?
    process.env.CORS_URLS.split(',') : ['http://localhost:3000']
}
