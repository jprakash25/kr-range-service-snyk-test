class HealthcheckController {
  healthy = null
  constructor() {
    this.healthy = () => ({ uptime: process.uptime() })
  }
  check() {
    const self = this
    return (req, res) => {
      res.status(200).json(self.healthy())
    }
  }
}

module.exports = new HealthcheckController()
