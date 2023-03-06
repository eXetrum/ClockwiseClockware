'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class City extends Model {
        static associate(models) {
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
            },
            pricePerHour: {
                type: DataTypes.FLOAT,
                defaultValue: 0.0,
                allowNull: false
            }
        },
        {
            sequelize,
            modelName: 'City',
            tableName: 'cities',
            associations: true
        }
    );

    return City;
};
