'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('orders', 'rating', {
            allowNull: true,
            type: Sequelize.DataTypes.INTEGER,
            defaultValue: null
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('orders', 'rating');
    }
};
