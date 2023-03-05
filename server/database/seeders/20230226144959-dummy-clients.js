'use strict';
const uuid = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.bulkInsert('clients', [
            {
                id: uuid.v4(),
                name: 'Client1DP',
                email: 'client1dp@dp.ua',
                password: '',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: uuid.v4(),
                name: 'Client2DP',
                email: 'client2dp@dp.ua',
                password: '',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: uuid.v4(),
                name: 'Client1UZ',
                email: 'client1uz@uz.ua',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: uuid.v4(),
                name: 'ClientZug@zug.zug',
                email: 'client-zug@zug.zug',
                password: '',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);
    },

    async down(queryInterface, Sequelize) {
        const Op = Sequelize.Op;
        return queryInterface.bulkDelete(
            'clients',
            {
                email: {
                    [Op.in]: ['client1dp@dp.ua', 'client2dp@dp.ua', 'client1uz@uz.ua', 'client-zug@zug.zug']
                }
            },
            {}
        );
    }
};
