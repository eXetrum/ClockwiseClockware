'use strict';

const { Model } = require('sequelize');
const { USER_ROLES } = require('../../constants');
const { hashPassword, compareSync } = require('../../utils');

module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        authenticate = (plainValue) => compareSync(plainValue, this.password);

        static associate(models) {
            /*User.hasOne(models.Client, {
                scope: {
                    role: 'admin'
                },
                as: 'admin',
                foreignKey:  'id'
            });*/

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
            }
        },
        {
            sequelize,
            modelName: 'User',
            tableName: 'users',
            associations: true
            /*scopes: {
                admin: {
                    where: {
                        role: 'admin'
                    },
                    include: [{ model: 'Admin' }]
                },
                master: {
                    where: {
                        role: 'master'
                    },
                    include: [{ model: 'Master' }]
                },
                client: {
                    where: {
                        role: 'client'
                    },
                    include: [{ model: 'Client' }]
                }
            }*/
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
