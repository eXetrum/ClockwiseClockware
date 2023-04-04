'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Image extends Model {
        static associate(models) {
            Image.belongsToMany(models.Order, {
                through: models.OrderImageList,
                as: 'orders',
                foreignKey: 'imageId'
            });
        }
    }
    Image.init(
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
            url: {
                allowNull: false,
                type: DataTypes.STRING
            }
        },
        {
            sequelize,
            modelName: 'Image',
            tableName: 'images',
            associations: true
        }
    );
    return Image;
};
