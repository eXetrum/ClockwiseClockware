'use strict';
const uuid = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.bulkInsert('admins', [
            {
                id: uuid.v4(),
                email: 'admin@example.com',
                password: 'passwordsecret',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);
    },

    async down(queryInterface, Sequelize) {
        const Op = Sequelize.Op;
        return queryInterface.bulkDelete('admins', { email: { [Op.in]: ['admin@example.com'] } }, {});
    }
};
