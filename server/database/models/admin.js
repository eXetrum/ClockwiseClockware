const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

const hashPassword = async (plaintextPassword) => {
    const hash = await bcrypt.hash(plaintextPassword, parseInt(process.env.BCRYPT_SALT_ROUNDS));
    return hash;
};

module.exports = (sequelize, DataTypes) => {
    class Admin extends Model {
        static associate(models) {}
        authenticate = (plainValue) => {
            return bcrypt.compareSync(plainValue, this.password);
        };
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

    Admin.addHook('beforeSave', 'hashPasswordHook', async (user, options) => {
        const hash = hashPassword(user.password);
        user.password = hash;
    });

    return Admin;
};
