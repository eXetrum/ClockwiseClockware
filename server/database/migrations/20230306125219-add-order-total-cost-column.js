'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('orders', 'totalCost', {
            type: Sequelize.FLOAT,
            defaultValue: 0.0,
            allowNull: false
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('orders', 'totalCost');
    }
};
