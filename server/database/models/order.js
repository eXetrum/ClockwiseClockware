'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Order extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Order.belongsTo(models.Client, { as: 'client', foreignKey: 'clientId' });
            Order.belongsTo(models.Watches, { as: 'watch', foreignKey: 'watchId' });
            Order.belongsTo(models.City, { as: 'city', foreignKey: 'cityId' });
            Order.belongsTo(models.Master, { as: 'master', foreignKey: 'masterId' });
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
                    key: 'id'
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
                    key: 'id'
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
                // allowNull: true,
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
