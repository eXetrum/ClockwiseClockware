const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Admin extends Model {
        static associate(models) {
            /*Admin.hasOne(models.User, {
                foreignKey: 'roleable_id',
                constraints: false,
                scope: {
                    roleable: 'admin'
                }
            });*/
            Admin.belongsTo(models.User, {
                foreignKey: 'user_ref_id',
                constraints: false,
                scope: {
                    role: 'admin'
                }
            });
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
