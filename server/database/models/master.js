const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Master extends Model {
        setEmailVerified(value) {
            this.setDataValue('isEmailVerified', value);
        }

        static associate(models) {
            Master.belongsToMany(models.City, {
                through: models.MasterCityList,
                foreignKey: 'masterId',
                sourceKey: 'userId',
                as: 'cities'
            });

            Master.hasMany(models.Order, {
                foreignKey: 'masterId',
                sourceKey: 'userId',
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
            countOfReview: {
                allowNull: false,
                type: DataTypes.INTEGER,
                defaultValue: 1
            },
            rating: {
                allowNull: false,
                type: DataTypes.DOUBLE
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
