'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return await queryInterface.removeColumn('masters', 'rating').then(() => {
            queryInterface.addColumn('masters', 'rating', {
                allowNull: false,
                type: Sequelize.DataTypes.DOUBLE
            });
        });
    },

    async down(queryInterface, Sequelize) {
        return await queryInterface.removeColumn('masters', 'rating').then(() => {
            queryInterface.addColumn('masters', 'rating', {
                allowNull: false,
                type: Sequelize.DataTypes.INTEGER
            });
        });
    }
};
