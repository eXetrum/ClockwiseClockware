'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return Promise.all([
            queryInterface.removeColumn('orders', 'masterId').then(() =>
                queryInterface.addColumn('orders', 'masterId', {
                    allowNull: false,
                    type: Sequelize.DataTypes.UUID,
                    references: {
                        model: 'masters',
                        key: 'userId'
                    },
                    onDelete: 'RESTRICT'
                })
            ),
            queryInterface.removeColumn('orders', 'clientId').then(() =>
                queryInterface.addColumn('orders', 'clientId', {
                    allowNull: false,
                    type: Sequelize.DataTypes.UUID,
                    references: {
                        model: 'clients',
                        key: 'userId'
                    },
                    onDelete: 'RESTRICT'
                })
            )
        ]);
    },
    async down(queryInterface, Sequelize) {
        return Promise.all([
            queryInterface.removeColumn('orders', 'masterId').then(() =>
                queryInterface.addColumn('orders', 'masterId', {
                    allowNull: false,
                    type: Sequelize.DataTypes.UUID,
                    references: {
                        model: 'masters',
                        key: 'id'
                    },
                    onDelete: 'RESTRICT'
                })
            ),
            queryInterface.removeColumn('orders', 'clientId').then(() =>
                queryInterface.addColumn('orders', 'clientId', {
                    allowNull: false,
                    type: Sequelize.DataTypes.UUID,
                    references: {
                        model: 'clients',
                        key: 'id'
                    },
                    onDelete: 'RESTRICT'
                })
            )
        ]);
    }
};
