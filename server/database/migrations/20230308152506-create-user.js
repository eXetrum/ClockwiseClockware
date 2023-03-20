'use strict';
const { USER_ROLES } = require('../../constants');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('users', {
            id: {
                type: Sequelize.DataTypes.UUID,
                defaultValue: Sequelize.DataTypes.UUIDV4,
                allowNull: false,
                primaryKey: true
            },
            email: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            password: {
                allowNull: false,
                type: Sequelize.DataTypes.STRING
            },
            role: {
                type: Sequelize.DataTypes.ENUM([...Object.values(USER_ROLES)]),
                allowNull: false
            },
            isEnabled: {
                allowNull: false,
                type: Sequelize.DataTypes.BOOLEAN,
                defaultValue: true
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DataTypes.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DataTypes.DATE
            }
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.sequelize.query('DROP TYPE "enum_users_status"; DROP TABLE users;');
    }
};
