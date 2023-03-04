'use strict';
const uuid = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        /**
         * Add seed commands here.
         *
         * Example:
         * await queryInterface.bulkInsert('People', [{
         *   name: 'John Doe',
         *   isBetaMember: false
         * }], {});
         */

        const dateToNearestHour = (timestamp) => {
            const ms = 1000 * 60 * 60;
            return Math.ceil(timestamp / ms) * ms;
        };

        const addHours = (date, hours) => {
            const newDate = new Date(date);
            newDate.setTime(newDate.getTime() + hours * 60 * 60 * 1000);
            return newDate;
        };

        const now = new Date();

        const oneYearFromNow = new Date(dateToNearestHour(now.getTime()));
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

        const pattern = [
            {
                clientEmail: 'client1dp@dp.ua',
                watchName: 'Маленький',
                cityName: 'Дніпро',
                masterEmail: 'master1@dp.ua',
                startDate: oneYearFromNow,
                endDate: null
            },
            {
                clientEmail: 'client1dp@dp.ua',
                watchName: 'Середній',
                cityName: 'Ужгород',
                masterEmail: 'master1@dp.ua',
                startDate: addHours(oneYearFromNow, +5),
                endDate: null
            },
            {
                clientEmail: 'client2dp@dp.ua',
                watchName: 'Середній',
                cityName: 'Дніпро',
                masterEmail: 'master2@dp.ua',
                startDate: oneYearFromNow,
                endDate: null
            },
            {
                clientEmail: 'client1uz@uz.ua',
                watchName: 'Великий',
                cityName: 'Ужгород',
                masterEmail: 'master1@uz.ua',
                startDate: oneYearFromNow,
                endDate: null
            }
        ];

        const sequelize = queryInterface.sequelize;

        return Promise.all([
            sequelize.query('SELECT id, email FROM clients', { type: sequelize.QueryTypes.SELECT }),
            sequelize.query('SELECT id, name, "repairTime" FROM watches', { type: sequelize.QueryTypes.SELECT }),
            sequelize.query('SELECT id, name FROM cities', { type: sequelize.QueryTypes.SELECT }),
            sequelize.query('SELECT id, email FROM masters', { type: sequelize.QueryTypes.SELECT })
        ]).then(([clients, watches, cities, masters]) => {
            const orders = [];
            pattern.forEach((p) => {
                const client = clients.find((client) => client.email == p.clientEmail);
                const watch = watches.find((watch) => watch.name == p.watchName);
                const city = cities.find((city) => city.name == p.cityName);
                const master = masters.find((master) => master.email == p.masterEmail);
                if (client && watch && city && master) {
                    orders.push({
                        id: uuid.v4(),
                        clientId: client.id,
                        watchId: watch.id,
                        cityId: city.id,
                        masterId: master.id,
                        startDate: p.startDate,
                        endDate: addHours(p.startDate, watch.repairTime),
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });
                }
            }); // pattern forEach end

            return queryInterface.bulkInsert('orders', orders, {});
        });
    },

    async down(queryInterface, Sequelize) {
        /**
         * Add commands to revert seed here.
         *
         * Example:
         * await queryInterface.bulkDelete('People', null, {});
         */
        const Op = Sequelize.Op;
        return queryInterface.bulkDelete('orders', null, {});
    }
};
