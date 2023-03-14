'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('orders', 'status', {
            type: Sequelize.DataTypes.ENUM(['confirmed', 'completed', 'canceled']),
            defaultValue: 'confirmed',
            allowNull: false
        });
    },
    async down(queryInterface, Sequelize) {
        // https://stackoverflow.com/a/74485531
        await queryInterface.sequelize.query('DROP TYPE "enum_orders_status"; ALTER TABLE "orders" DROP COLUMN "status"');
    }
};
