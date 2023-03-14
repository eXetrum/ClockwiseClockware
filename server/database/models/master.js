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

            Master.belongsTo(models.User, { foreignKey: 'userId' });
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
            name: {
                allowNull: false,
                type: DataTypes.STRING
            },
            rating: {
                allowNull: false,
                type: DataTypes.INTEGER
            },
            isEmailVerified: {
                allowNull: false,
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
            isApprovedByAdmin: {
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
            modelName: 'Master',
            tableName: 'masters',
            associations: true
        }
    );

    return Master;
};
