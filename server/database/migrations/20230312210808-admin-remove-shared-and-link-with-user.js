'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await Promise.all([
            await queryInterface.removeColumn('admins', 'email'),
            await queryInterface.removeColumn('admins', 'password'),
            await queryInterface.addColumn('admins', 'userId', {
                type: Sequelize.DataTypes.UUID,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            })
        ]);
    },

    async down(queryInterface, Sequelize) {
        await Promise.all([
            await queryInterface.removeColumn('admins', 'userId'),
            await queryInterface.addColumn('admins', 'password', {
                allowNull: false,
                type: Sequelize.DataTypes.STRING
            }),
            await queryInterface.addColumn('admins', 'email', {
                allowNull: false,
                unique: true,
                type: Sequelize.DataTypes.STRING
            })
        ]);
    }
};
