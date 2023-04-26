'use strict';
const { ORDER_STATUS } = require('../../constants');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.sequelize.query('DROP TYPE "enum_orders_status"; ALTER TABLE "orders" DROP COLUMN "status"').then(() =>
            queryInterface.addColumn('orders', 'status', {
                type: Sequelize.DataTypes.ENUM(Object.values(ORDER_STATUS)),
                defaultValue: ORDER_STATUS.WAITING_FOR_PAYMENT,
                allowNull: false
            })
        );
    },

    async down(queryInterface, Sequelize) {
        return queryInterface.sequelize.query('DROP TYPE "enum_orders_status"; ALTER TABLE "orders" DROP COLUMN "status"').then(() =>
            queryInterface.addColumn('orders', 'status', {
                type: Sequelize.DataTypes.ENUM(Object.values(ORDER_STATUS)),
                defaultValue: ORDER_STATUS.CONFIRMED,
                allowNull: false
            })
        );
    }
};
