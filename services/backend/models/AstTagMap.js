const Sequelize = require('sequelize');
const { DataTypes, Model } = Sequelize;

module.exports = (sequelize) => {
    class AstTagMap extends Model {}
  
    AstTagMap.init({
      id: {
        type: DataTypes.STRING,
              primaryKey: true,
      },
      assetId: {
        type: DataTypes.STRING,
        allowNull: false,
              references: {
                  model: 'asts',
                  key: 'id'
              }
      },
      tagId: {
              type: DataTypes.STRING,
        allowNull: false,
              references: {
                  model: 'ast_tags',
                  key: 'id'
              }
      },
      eventId: {
          type: DataTypes.STRING,
          references: {
            model: 'events',
            key: 'id',
          },
      },
    }, {
      sequelize,
      modelName: 'AstTagMap',
    });
    return AstTagMap;
  }
  