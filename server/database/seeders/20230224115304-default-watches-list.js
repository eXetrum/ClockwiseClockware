'use strict';
const uuid = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.bulkInsert('watches', [
            {
                id: uuid.v4(),
                name: 'Small',
                repairTime: 1,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: uuid.v4(),
                name: 'Mid',
                repairTime: 2,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: uuid.v4(),
                name: 'Large',
                repairTime: 3,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);
    },

    async down(queryInterface, Sequelize) {
        const Op = Sequelize.Op;
        return queryInterface.bulkDelete(
            'watches',
            {
                name: {
                    [Op.in]: ['Small', 'Mid', 'Large']
                }
            },
            {}
        );
    }
};
