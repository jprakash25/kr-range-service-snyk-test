const size = {
  apn: 9341105575484,
  size: {
    code: '0',
    name: 'NO SIZE',
    sortSequence: 10
  },
  sellPrices: {
    australia: [
      {
        endDate: '9999-12-31',
        priceExGst: 2.7273,
        priceIncGst: 3,
        effectiveDate: '2017-12-30'
      }
    ],
    newZealand: [
      {
        endDate: '9999-12-31',
        priceExGst: 3.4783,
        priceIncGst: 4,
        effectiveDate: '2017-12-30'
      }
    ]
  },
  productStatus: {
    australia: {
      code: '4',
      name: 'Allocated'
    },
    newZealand: {
      code: '4',
      name: 'Allocated'
    }
  }
}

const getProducts = (options) => {
  return options.map(option => {
    const sizes = {
      ...size,
      keycodeNumber: Math.floor(100000 + Math.random() * 900000)
    }
    return {
      option: {
        id: option,
        sizes: [sizes],
        sequence: Math.floor(100 + Math.random() * 900),
        primaryColour: {
          code: '350.0',
          name: 'BLUE'
        },
        secondaryColour: {
          code: null,
          name: 'ALLURE'
        },
        colourDescription: 'ALLURE'
      },
      ipm_on_range: '22/06/2020',
      ipm_off_range: '21/06/2021'
    }
  })
}

const options = [
  '0015323c66f9426ca64486d716a8dfa5',
  '0067fc4b0f2c4d609a11964c835e3162',
  '00884779302d4a46818bed522e04c582',
  '002bc646e0bb4190b693df6512165951',
  '00be6f76dbccfcbb685c843a8989f278',
  '0023a2821cb3480f8760302d6f6c83f5'
]

exports.getGMData = () => {
  const commonData = require('./gm-common-data.json')
  return {
    products: getProducts(options),
    ...commonData
  }
}
