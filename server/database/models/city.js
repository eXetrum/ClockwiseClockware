'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class City extends Model {
        static associate(models) {
            City.belongsToMany(models.Master, {
                through: models.MasterCityList,
                as: 'masters',
                foreignKey: 'cityId'
            });
        }
    }
    City.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                allowNull: false,
                primaryKey: true
            },
            name: {
                allowNull: false,
                unique: true,
                type: DataTypes.STRING
            },
            pricePerHour: {
                type: DataTypes.BIGINT,
                defaultValue: 0,
                allowNull: false,
                get() {
                    return Number(this.getDataValue('pricePerHour') / 100).toFixed(2);
                },
                set(value) {
                    this.setDataValue('pricePerHour', Math.round(value * 100));
                }
            }
        },
        {
            sequelize,
            modelName: 'City',
            tableName: 'cities',
            associations: true,
            hooks: {
                beforeFind: (options) => {
                    if (options && options.where && options.where.pricePerHour) {
                        const pricePerHour = options.where.pricePerHour;
                        if (typeof pricePerHour === 'number') {
                            options.where.pricePerHour = Math.round(pricePerHour * 100);
                        } else if (typeof pricePerHour === 'object') {
                            const keys = [
                                ...Object.getOwnPropertyNames(options.where.pricePerHour),
                                ...Object.getOwnPropertySymbols(options.where.pricePerHour)
                            ];
                            keys.forEach((operator) => {
                                const value = pricePerHour[operator];
                                options.where.pricePerHour[operator] = Math.round(parseFloat(value) * 100);
                            });
                        } else {
                            throw new Error('Invalid pricePerHour value');
                        }
                    }
                }
            }
        }
    );

    return City;
};
