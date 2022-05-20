const axios = require('axios')

const taggedDataHandler = async (event) => {
  try {
    console.log(`Invoking tagged data trigger endpoint`, event)
    await axios.get(`http://${process.env.LOAD_BALANCER_URL}/range/triggerPublishChannelInfo`)
    console.log('Successfully invoked tagged data trigger endpoint')
  } catch (err) {
    console.log(`Error in invoking tagged data trigger endpoint: ${err}`)
  }
}

const validProductHandler = async (event) => {
  try {
    console.log(`Invoking update valid product endpoint`, event)
    await axios.post(`http://${process.env.LOAD_BALANCER_URL}/range/updateValidProduct`)
    console.log('Successfully invoked update valid product endpoint')
  } catch (err) {
    console.log(`Error in invoking update valid product endpoint: ${err}`)
  }
}

const kmartTaggedDataHandler = async (event) => {
  try {
    console.log(`Invoking Kmart tagged data trigger endpoint`, event)
  } catch (err) {
    console.log(`Error in invoking Kmart tagged data trigger endpoint: ${err}`)
  }
}

module.exports = { taggedDataHandler, validProductHandler, kmartTaggedDataHandler }
