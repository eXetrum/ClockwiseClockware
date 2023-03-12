'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Client extends Model {
        static associate(models) {
            Client.hasMany(models.Order, {
                foreignKey: 'clientId',
                as: 'orders'
            });

            Client.belongsTo(models.User, { foreignKey: 'userId' });
        }
    }

    Client.init(
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
            isActive: {
                allowNull: false,
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
            userId: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            }
        },
        {
            sequelize,
            modelName: 'Client',
            tableName: 'clients',
            associations: true
        }
    );

    return Client;
};
