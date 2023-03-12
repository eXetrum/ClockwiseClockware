'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class MasterCityList extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            MasterCityList.belongsTo(models.Master, { foreignKey: 'masterId' });
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
                    key: 'id'
                },
                onDelete: 'RESTRICT'
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
