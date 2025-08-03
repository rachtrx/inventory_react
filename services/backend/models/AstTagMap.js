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
      addEventId: {
        type: DataTypes.STRING,
        references: {
          model: 'events',
          key: 'id',
        },
      },
      delEventId: {
          type: DataTypes.STRING,
          references: {
            model: 'events',
            key: 'id',
          },
      },
    }, {
      sequelize,
      modelName: 'AstTagMap',
      indexes: [
        {
          unique: true,
          fields: ['asset_id', 'tag_id'],
          where: {
            'del_event_id': null,
          },
        },
      ],
    });
    return AstTagMap;
  }
  