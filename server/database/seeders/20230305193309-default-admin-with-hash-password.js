const uuid = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        try {
            const Op = Sequelize.Op;
            await queryInterface.bulkDelete('admins', { email: { [Op.in]: ['admin@example.com'] } }, {});
        } catch {}
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
