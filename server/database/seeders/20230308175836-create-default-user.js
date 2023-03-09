const uuid = require('uuid');
const { hashPassword } = require('../../middleware/RouteProtector');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.bulkInsert('users', [
            {
                id: uuid.v4(),
                email: 'admin@example.com',
                password: await hashPassword('passwordsecret'),
                roleable: 'admin',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);
    },

    async down(queryInterface, Sequelize) {
        const Op = Sequelize.Op;
        return queryInterface.bulkDelete('users', { email: { [Op.in]: ['admin@example.com'] } }, {});
    }
};
