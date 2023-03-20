'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Confirmations extends Model {
        static associate(models) {
            Confirmations.belongsTo(models.User, { foreignKey: 'userId' });
        }
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
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
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
