'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('masters', {
            id: {
                type: Sequelize.DataTypes.UUID,
                defaultValue: Sequelize.DataTypes.UUIDV4,
                allowNull: false,
                primaryKey: true
            },
            email: {
                allowNull: false,
                unique: true,
                type: Sequelize.DataTypes.STRING
            },
            password: {
                allowNull: true,
                type: Sequelize.DataTypes.STRING
            },
            name: {
                allowNull: false,
                type: Sequelize.DataTypes.STRING
            },
            rating: {
                allowNull: false,
                type: Sequelize.DataTypes.INTEGER
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
        await queryInterface.dropTable('masters');
    }
};
