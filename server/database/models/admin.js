const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Admin extends Model {
        static associate(models) {
            Admin.belongsTo(models.User, { foreignKey: 'userId' });
        }
    }
    Admin.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                allowNull: false,
                primaryKey: true
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
            modelName: 'Admin',
            tableName: 'admins'
        }
    );

    return Admin;
};
