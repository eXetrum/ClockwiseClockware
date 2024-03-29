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
                unique: true,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            }),
            await queryInterface.addColumn('masters', 'isEmailVerified', {
                allowNull: false,
                type: Sequelize.DataTypes.BOOLEAN,
                defaultValue: false
            }),
            await queryInterface.addColumn('masters', 'isApprovedByAdmin', {
                allowNull: false,
                type: Sequelize.DataTypes.BOOLEAN,
                defaultValue: false
            })
        ]);
    },

    async down(queryInterface, Sequelize) {
        await Promise.all([
            await queryInterface.removeColumn('masters', 'isApprovedByAdmin'),
            await queryInterface.removeColumn('masters', 'isEmailVerified'),
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
