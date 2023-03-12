const { hashPassword } = require('../../utils');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const hash = await hashPassword('passwordsecret');
        const Op = Sequelize.Op;
        return queryInterface.bulkUpdate('admins', { password: hash }, { email: { [Op.in]: ['admin@example.com'] } });
    },

    async down(queryInterface, Sequelize) {
        const Op = Sequelize.Op;
        return queryInterface.bulkDelete('admins', { email: { [Op.in]: ['admin@example.com'] } }, {});
    }
};
