'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Watches extends Model {
        static associate(models) {}
    }
    Watches.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                allowNull: false,
                primaryKey: true
            },
            name: {
                allowNull: false,
                type: DataTypes.STRING
            },
            repairTime: {
                allowNull: false,
                type: DataTypes.INTEGER
            }
        },
        {
            sequelize,
            modelName: 'Watches',
            tableName: 'watches'
        }
    );

    return Watches;
};
