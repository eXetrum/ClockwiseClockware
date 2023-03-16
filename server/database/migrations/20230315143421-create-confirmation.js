'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('confirmations', {
            id: {
                type: Sequelize.DataTypes.UUID,
                defaultValue: Sequelize.DataTypes.UUIDV4,
                allowNull: false,
                primaryKey: true
            },
            userId: {
                type: Sequelize.DataTypes.UUID,
                allowNull: false
            },
            token: {
                allowNull: false,
                type: Sequelize.STRING
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('confirmations');
    }
};
