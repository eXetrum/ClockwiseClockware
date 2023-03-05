const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Master extends Model {
        static associate(models) {
            Master.belongsToMany(models.City, {
                through: models.MasterCityList,
                as: 'cities',
                foreignKey: 'masterId'
            });
            Master.hasMany(models.Order, {
                foreignKey: 'masterId',
                as: 'orders'
            });
        }
    }

    Master.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                allowNull: false,
                primaryKey: true
            },
            email: {
                allowNull: false,
                unique: true,
                type: DataTypes.STRING
            },
            password: {
                allowNull: true,
                type: DataTypes.STRING
            },
            name: {
                allowNull: false,
                type: DataTypes.STRING
            },
            rating: {
                allowNull: false,
                type: DataTypes.INTEGER
            }
        },
        {
            sequelize,
            modelName: 'Master',
            tableName: 'masters',
            associations: true
        }
    );

    return Master;
};
