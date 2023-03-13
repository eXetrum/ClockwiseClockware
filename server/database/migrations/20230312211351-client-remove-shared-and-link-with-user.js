'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await Promise.all([
            await queryInterface.removeColumn('clients', 'email'),
            await queryInterface.removeColumn('clients', 'password'),
            await queryInterface.addColumn('clients', 'userId', {
                type: Sequelize.DataTypes.UUID,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            }),
            await queryInterface.addColumn('clients', 'isActive', {
                allowNull: false,
                type: Sequelize.DataTypes.BOOLEAN,
                defaultValue: false
            })
        ]);
    },

    async down(queryInterface, Sequelize) {
        await Promise.all([
            await queryInterface.removeColumn('clients', 'isActive'),
            await queryInterface.removeColumn('clients', 'userId'),
            await queryInterface.addColumn('clients', 'password', {
                allowNull: false,
                type: Sequelize.DataTypes.STRING
            }),
            await queryInterface.addColumn('clients', 'email', {
                allowNull: false,
                unique: true,
                type: Sequelize.DataTypes.STRING
            })
        ]);
    }
};
