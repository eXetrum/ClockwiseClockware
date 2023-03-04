'use strict';
const uuid = require('uuid');
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class City extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            City.belongsToMany(models.Master, {
                through: models.MasterCityList,
                as: 'masters',
                foreignKey: 'cityId'
            });
        }
    }
    City.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                allowNull: false,
                primaryKey: true
            },
            name: {
                allowNull: false,
                unique: true,
                type: DataTypes.STRING
            }
        },
        {
            sequelize,
            modelName: 'City',
            tableName: 'cities',
            associations: true
        }
    );

    // City.beforeCreate(city => city.id = uuid.v4());

    return City;
};
