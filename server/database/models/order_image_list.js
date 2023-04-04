'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class OrderImageList extends Model {
        static associate(models) {
            OrderImageList.belongsTo(models.Order, { foreignKey: 'orderId' });
            OrderImageList.belongsTo(models.Image, { foreignKey: 'imageId' });
        }
    }
    OrderImageList.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            orderId: {
                allowNull: false,
                type: DataTypes.UUID,
                references: {
                    model: 'orders',
                    key: 'id'
                },
                onDelete: 'CASCADE'
            },
            imageId: {
                allowNull: false,
                type: DataTypes.UUID,
                references: {
                    model: 'images',
                    key: 'id'
                },
                onDelete: 'RESTRICT'
            }
        },
        {
            sequelize,
            modelName: 'OrderImageList',
            tableName: 'order_image_list',
            associations: true
        }
    );
    return OrderImageList;
};
