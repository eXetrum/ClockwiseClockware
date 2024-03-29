'use strict';
const { Model } = require('sequelize');

const { ORDER_STATUS } = require('../../constants');

module.exports = (sequelize, DataTypes) => {
    class Order extends Model {
        static associate(models) {
            Order.belongsTo(models.Client, { as: 'client', foreignKey: 'clientId', targetKey: 'userId' });
            Order.belongsTo(models.Watches, { as: 'watch', foreignKey: 'watchId' });
            Order.belongsTo(models.City, { as: 'city', foreignKey: 'cityId' });
            Order.belongsTo(models.Master, { as: 'master', foreignKey: 'masterId', targetKey: 'userId' });
            Order.belongsToMany(models.Image, {
                through: models.OrderImageList,
                foreignKey: 'orderId',
                as: 'images'
            });
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
                type: DataTypes.ENUM(Object.values(ORDER_STATUS)),
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
            },
            rating: {
                allowNull: true,
                type: DataTypes.DOUBLE,
                defaultValue: null
            }
        },
        {
            sequelize,
            modelName: 'Order',
            tableName: 'orders',
            associations: true,
            hooks: {
                beforeFind: (options) => {
                    if (options && options.where && options.where.totalCost) {
                        const totalCost = options.where.totalCost;
                        if (typeof totalCost === 'number') {
                            options.where.totalCost = Math.round(totalCost * 100);
                        } else if (typeof totalCost === 'object') {
                            const keys = [
                                ...Object.getOwnPropertyNames(options.where.totalCost),
                                ...Object.getOwnPropertySymbols(options.where.totalCost)
                            ];
                            keys.forEach((operator) => {
                                const value = totalCost[operator];
                                options.where.totalCost[operator] = Math.round(parseFloat(value) * 100);
                            });
                        } else {
                            throw new Error('Invalid totalCost value');
                        }
                    }
                }
            }
        }
    );

    return Order;
};
