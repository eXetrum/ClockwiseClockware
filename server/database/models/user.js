'use strict';

const { Model } = require('sequelize');
const { USER_ROLES } = require('../../constants');
const { hashPassword, compareSync } = require('../../utils');

module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        authenticate = (plainValue) => compareSync(plainValue, this.password);

        getDetails = async () => {
            if (this.role === 'admin') return await this.getAdmin();
            if (this.role === 'master') return await this.getMaster();
            if (this.role === 'client') return await this.getClient();
        };

        static associate(models) {
            User.hasOne(models.Admin, { foreignKey: 'userId' });
            User.hasOne(models.Master, { foreignKey: 'userId' });
            User.hasOne(models.Client, { foreignKey: 'userId' });
        }
    }
    User.init(
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
            },
            role: {
                type: DataTypes.ENUM([...Object.values(USER_ROLES)]),
                allowNull: false
            },
            isActive: {
                allowNull: false,
                type: DataTypes.BOOLEAN,
                defaultValue: true
            }
        },
        {
            sequelize,
            modelName: 'User',
            tableName: 'users',
            associations: true,
            defaultScope: {
                attributes: {
                    exclude: ['password']
                },
                order: [['createdAt', 'DESC']]
            },
            scopes: {
                withPassword: {
                    attributes: {
                        include: ['password']
                    }
                }
            }
        }
    );

    User.addHook('beforeSave', 'hashPasswordHook', async (user, options) => {
        const hash = await hashPassword(user.password);
        user.password = hash;
    });
    User.addHook('beforeBulkCreate', 'hashPasswordHookMany', async (users, options) => {
        users.forEach(async (user) => {
            const hash = await hashPassword(user.password);
            user.password = hash;
        });
    });

    return User;
};
