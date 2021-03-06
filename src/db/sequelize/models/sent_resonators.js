'use strict';
module.exports = function(sequelize, DataTypes) {
  var sent_resonators = sequelize.define('sent_resonators', {
      id: {
          type: DataTypes.UUID,
          primaryKey: true
      },
      resonator_id: DataTypes.UUID,
      failed: DataTypes.BOOLEAN
  }, {
    underscored: true,
    classMethods: {
      associate: function(models) {
          sent_resonators.belongsTo(models.resonators);
      }
    }
  });
  return sent_resonators;
};
