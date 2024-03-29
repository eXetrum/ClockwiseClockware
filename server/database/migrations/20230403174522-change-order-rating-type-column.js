'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return await queryInterface.removeColumn('orders', 'rating').then(() => {
            queryInterface.addColumn('orders', 'rating', {
                allowNull: true,
                defaultValue: null,
                type: Sequelize.DataTypes.DOUBLE
            });
        });
    },

    async down(queryInterface, Sequelize) {
        return await queryInterface.removeColumn('orders', 'rating').then(() => {
            queryInterface.addColumn('orders', 'rating', {
                allowNull: true,
                defaultValue: null,
                type: Sequelize.DataTypes.INTEGER
            });
        });
    }
};
