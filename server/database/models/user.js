'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        static associate(models) {
            // define association here
            User.hasOne(models.Admin);
            User.hasOne(models.Master);
            User.hasOne(models.Client);
            /*User.belongsToMany(models.Admin, {
                //through: models.MasterCityList,
                as: 'cities',
                foreignKey: 'masterId'
            });*/
            /*Master.hasMany(models.Order, {
              foreignKey: 'masterId',
              as: 'orders'
          });*/
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
                /*set(value) {
                    this.setDataValue('password', hash(this.username + value));
                }*/
            },
            role: {
                type: DataTypes.ENUM(['admin', 'master', 'client']),
                allowNull: false
            },
            user_ref_id: {
                allowNull: false,
                type: DataTypes.UUID
            }
        },
        {
            sequelize,
            modelName: 'User',
            tableName: 'users',
            associations: true,
            scopes: {
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
            }
        }
    );
    return User;
};
