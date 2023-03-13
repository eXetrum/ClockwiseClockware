const uuid = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.bulkInsert('cities', [
            {
                id: uuid.v4(),
                name: 'Dnipro',
                pricePerHour: 525,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: uuid.v4(),
                name: 'Uzhgorod',
                pricePerHour: 125,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);
    },

    async down(queryInterface, Sequelize) {
        const Op = Sequelize.Op;
        return queryInterface.bulkDelete('cities', { name: { [Op.in]: ['Dnipro', 'Uzhgorod'] } }, {});
    }
};
