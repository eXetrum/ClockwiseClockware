'use strict';
const uuid = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.bulkInsert('masters', [
            {
                id: uuid.v4(),
                name: 'MasterDp1',
                email: 'master1@dp.ua',
                password: '',
                rating: 5,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: uuid.v4(),
                name: 'MasterDp2',
                email: 'master2@dp.ua',
                password: '',
                rating: 4,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: uuid.v4(),
                name: 'MasterUz1',
                email: 'master1@uz.ua',
                password: '',
                rating: 5,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: uuid.v4(),
                name: 'Orphan',
                email: 'orphan@zug.zug',
                password: '',
                rating: 5,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);
    },

    async down(queryInterface, Sequelize) {
        const Op = Sequelize.Op;
        return queryInterface.bulkDelete(
            'masters',
            {
                email: {
                    [Op.in]: ['master1@dp.ua', 'master2@dp.ua', 'master1@uz.ua', 'orphan@zug.zug']
                }
            },
            {}
        );
    }
};
