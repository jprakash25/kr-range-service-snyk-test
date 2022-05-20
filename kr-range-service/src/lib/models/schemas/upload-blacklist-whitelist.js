const Sequelize = require('sequelize')

const UploadBlackListWhiteList = sequelize =>
  sequelize.define('upload_blacklist_whitelist', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.BIGINT
    },
    channel: {
      allowNull: false,
      type: Sequelize.STRING
    },
    department: {
      allowNull: false,
      type: Sequelize.STRING
    },
    family: {
      allowNull: true,
      type: Sequelize.STRING
    },
    class: {
      allowNull: true,
      type: Sequelize.STRING
    },
    subclass: {
      allowNull: true,
      type: Sequelize.STRING
    },
    subsubclass: {
      allowNull: true,
      type: Sequelize.STRING
    },
    basedOn: {
      allowNull: false,
      type: Sequelize.ENUM,
      values: [
        'department',
        'family',
        'class',
        'subclass',
        'subsubclass'
      ],

    },
    effectiveDate: {
      allowNull: false,
      type: Sequelize.DATE
    },
    expiryDate: {
      allowNull: true,
      type: Sequelize.DATE
    },
    isWhitelisted: {
      allowNull: true,
      type: Sequelize.BOOLEAN
    },
    isBlacklisted: {
      allowNull: true,
      type: Sequelize.BOOLEAN
    },
    updatedBy: {
      allowNull: true,
      type: Sequelize.STRING
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE
    }
  }, {
    timestamps: false,
    underscored: true,
    freezeTableName: true
  })

module.exports = UploadBlackListWhiteList
