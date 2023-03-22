'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('masters', 'countOfReview', {
            allowNull: false,
            type: Sequelize.DataTypes.INTEGER,
            defaultValue: 1
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('masters', 'countOfReview');
    }
};
