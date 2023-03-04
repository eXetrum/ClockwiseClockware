const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Admin extends Model {
        static associate(models) {}
    }
    Admin.init(
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
                allowNull: false,
                type: DataTypes.STRING
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
