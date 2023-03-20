'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Order extends Model {
        static associate(models) {
            // define association here
            Order.belongsTo(models.Client, { as: 'client', foreignKey: 'clientId', targetKey: 'userId' });
            Order.belongsTo(models.Watches, { as: 'watch', foreignKey: 'watchId' });
            Order.belongsTo(models.City, { as: 'city', foreignKey: 'cityId' });
            Order.belongsTo(models.Master, { as: 'master', foreignKey: 'masterId', targetKey: 'userId' });
        }
    }

    Order.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                allowNull: false,
                primaryKey: true
            },
            clientId: {
                allowNull: false,
                type: DataTypes.UUID,
                references: {
                    model: 'clients',
                    key: 'userId'
                },
                onDelete: 'RESTRICT'
            },
            watchId: {
                allowNull: false,
                type: DataTypes.UUID,
                references: {
                    model: 'watches',
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
            },
            masterId: {
                allowNull: false,
                type: DataTypes.UUID,
                references: {
                    model: 'masters',
                    key: 'userId'
                },
                onDelete: 'RESTRICT'
            },
            startDate: {
                type: DataTypes.DATE,
                allowNull: false
            },
            endDate: {
                type: DataTypes.DATE,
                allowNull: false
            },
            status: {
                type: DataTypes.ENUM(['confirmed', 'completed', 'canceled']),
                allowNull: false,
                defaultValue: 'confirmed'
            },
            totalCost: {
                type: DataTypes.BIGINT,
                defaultValue: 0,
                allowNull: false,
                get() {
                    return Number(this.getDataValue('totalCost') / 100).toFixed(2);
                },
                set(value) {
                    this.setDataValue('totalCost', value * 100);
                }
            }
        },
        {
            sequelize,
            modelName: 'Order',
            tableName: 'orders',
            associations: true
        }
    );

    return Order;
};
