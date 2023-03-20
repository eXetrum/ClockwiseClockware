'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Confirmations extends Model {
        static associate(models) {}
    }
    Confirmations.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                allowNull: false,
                primaryKey: true
            },
            userId: {
                type: DataTypes.UUID,
                allowNull: false
            },
            token: {
                allowNull: false,
                type: DataTypes.STRING
            }
        },

        {
            sequelize,
            modelName: 'Confirmations',
            tableName: 'confirmations'
        }
    );
    return Confirmations;
};
