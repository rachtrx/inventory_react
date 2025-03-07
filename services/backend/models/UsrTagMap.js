const Sequelize = require('sequelize');
const { DataTypes, Model } = Sequelize;

module.exports = (sequelize) => {
    class UsrTagMap extends Model {}
  
    UsrTagMap.init({
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: 'usrs',
                key: 'id'
            }
        },
        tagId: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: 'usr_tags',
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
      modelName: 'UsrTagMap',
    });
    return UsrTagMap;
}
  