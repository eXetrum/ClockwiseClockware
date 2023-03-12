'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await Promise.all([
            await queryInterface.removeColumn('masters', 'email'),
            await queryInterface.removeColumn('masters', 'password'),
            await queryInterface.addColumn('masters', 'userId', {
                type: Sequelize.DataTypes.UUID,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            }),
            await queryInterface.addColumn('masters', 'isActive', {
                allowNull: false,
                type: Sequelize.DataTypes.BOOLEAN,
                defaultValue: false
            })
        ]);
    },

    async down(queryInterface, Sequelize) {
        await Promise.all([
            await queryInterface.removeColumn('masters', 'isActive'),
            await queryInterface.removeColumn('masters', 'userId'),
            await queryInterface.addColumn('masters', 'password', {
                allowNull: false,
                type: Sequelize.DataTypes.STRING
            }),
            await queryInterface.addColumn('masters', 'email', {
                allowNull: false,
                unique: true,
                type: Sequelize.DataTypes.STRING
            })
        ]);
    }
};
