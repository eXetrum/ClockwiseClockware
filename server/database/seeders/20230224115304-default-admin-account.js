const uuid = require('uuid');
const { hashPassword } = require('../../utils');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const hash = await hashPassword('passwordsecret');
        return queryInterface
            .bulkInsert(
                'users',
                [
                    {
                        id: uuid.v4(),
                        email: 'admin@example.com',
                        password: hash,
                        role: 'admin',
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }
                ],
                {
                    returning: true
                }
            )
            .then((users) =>
                queryInterface.bulkInsert('admins', [{ id: uuid.v4(), userId: users[0].id, createdAt: new Date(), updatedAt: new Date() }])
            );
    },

    async down(queryInterface, Sequelize) {
        const Op = Sequelize.Op;
        return queryInterface
            .bulkDelete('users', { email: { [Op.in]: ['admin@example.com'] } }, { returning: true })
            .then((user) => queryInterface.bulkDelete('admins', { userId: user.id }));
    }
};
