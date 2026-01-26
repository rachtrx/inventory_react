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
      modelName: 'UsrTagMap',
      indexes: [
        {
          unique: true,
          fields: ['user_id', 'tag_id'],
          where: {
            'del_event_id': null,
          },
        },
      ],
    });
    return UsrTagMap;
}
  