'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('orders', {
            id: {
                type: Sequelize.DataTypes.UUID,
                defaultValue: Sequelize.DataTypes.UUIDV4,
                allowNull: false,
                primaryKey: true
            },
            clientId: {
                allowNull: false,
                type: Sequelize.DataTypes.UUID,
                references: {
                    model: 'clients',
                    key: 'id'
                },
                onDelete: 'RESTRICT'
            },
            watchId: {
                allowNull: false,
                type: Sequelize.DataTypes.UUID,
                references: {
                    model: 'watches',
                    key: 'id'
                },
                onDelete: 'RESTRICT'
            },
            cityId: {
                allowNull: false,
                type: Sequelize.DataTypes.UUID,
                references: {
                    model: 'cities',
                    key: 'id'
                },
                onDelete: 'RESTRICT'
            },
            masterId: {
                allowNull: false,
                type: Sequelize.DataTypes.UUID,
                references: {
                    model: 'masters',
                    key: 'id'
                },
                onDelete: 'RESTRICT'
            },
            startDate: {
                type: Sequelize.DataTypes.DATE,
                allowNull: false
            },
            endDate: {
                type: Sequelize.DataTypes.DATE,
                allowNull: false
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
        await queryInterface.dropTable('orders');
    }
};
