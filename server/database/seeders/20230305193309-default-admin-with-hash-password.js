const bcrypt = require('bcryptjs');

const hashPassword = async (plaintextPassword) => {
    const hash = await bcrypt.hash(plaintextPassword, parseInt(process.env.BCRYPT_SALT_ROUNDS));
    return hash;
};

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
