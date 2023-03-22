'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class MasterCityList extends Model {
        static associate(models) {
            MasterCityList.belongsTo(models.Master, { foreignKey: 'masterId', targetKey: 'userId' });
            MasterCityList.belongsTo(models.City, { foreignKey: 'cityId' });
        }
    }
    MasterCityList.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            masterId: {
                allowNull: false,
                type: DataTypes.UUID,
                references: {
                    model: 'masters',
                    key: 'userId'
                },
                onDelete: 'CASCADE'
            },
            cityId: {
                allowNull: false,
                type: DataTypes.UUID,
                references: {
                    model: 'cities',
                    key: 'id'
                },
                onDelete: 'RESTRICT'
            }
        },
        {
            sequelize,
            modelName: 'MasterCityList',
            tableName: 'master_city_list',
            associations: true
        }
    );
    return MasterCityList;
};
