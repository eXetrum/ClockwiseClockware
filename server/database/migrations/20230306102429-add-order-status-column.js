'use strict';
const { ORDER_STATUS } = require('../../constants');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('orders', 'status', {
            type: Sequelize.DataTypes.ENUM(Object.values(ORDER_STATUS)),
            defaultValue: 'confirmed',
            allowNull: false
        });
    },
    async down(queryInterface, Sequelize) {
        // https://stackoverflow.com/a/74485531
        await queryInterface.sequelize.query('DROP TYPE "enum_orders_status"; ALTER TABLE "orders" DROP COLUMN "status"');
    }
};
