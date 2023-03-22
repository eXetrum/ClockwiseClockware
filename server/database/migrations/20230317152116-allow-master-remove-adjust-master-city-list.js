'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.removeColumn('master_city_list', 'masterId').then(() =>
            queryInterface.addColumn('master_city_list', 'masterId', {
                allowNull: false,
                type: Sequelize.DataTypes.UUID,
                references: {
                    model: 'masters',
                    key: 'userId'
                },
                onDelete: 'CASCADE'
            })
        );
    },
    async down(queryInterface, Sequelize) {
        return queryInterface.removeColumn('master_city_list', 'masterId').then(() =>
            queryInterface.addColumn('master_city_list', 'masterId', {
                allowNull: false,
                type: Sequelize.DataTypes.UUID,
                references: {
                    model: 'masters',
                    key: 'userId'
                },
                onDelete: 'RESTRICT'
            })
        );
    }
};
