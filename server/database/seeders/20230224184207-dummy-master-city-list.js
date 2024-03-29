/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const pattern = [
            { email: 'master1@dp.ua', cities: ['Dnipro', 'Uzhgorod'] },
            { email: 'master2@dp.ua', cities: ['Dnipro'] },
            { email: 'master1@uz.ua', cities: ['Uzhgorod'] }
        ];

        const sequelize = queryInterface.sequelize;

        return Promise.all([
            sequelize.query('SELECT id, name FROM cities', { type: sequelize.QueryTypes.SELECT }),
            sequelize.query('SELECT U.id, email FROM users AS U INNER JOIN masters AS M ON U.id=M."userId"', {
                type: sequelize.QueryTypes.SELECT
            })
        ]).then(([cities, masters]) => {
            const cityForMasters = [];
            pattern.forEach((p) => {
                const master = masters.find((item) => item.email === p.email);
                if (master) {
                    p.cities.forEach((cityName) => {
                        const city = cities.find((item) => item.name === cityName);
                        if (city) {
                            cityForMasters.push({
                                masterId: master.id,
                                cityId: city.id,
                                createdAt: new Date(),
                                updatedAt: new Date()
                            });
                        }
                    }); // current pattern item forEach end
                }
            }); // pattern forEach end

            return queryInterface.bulkInsert('master_city_list', cityForMasters, {});
        }); // spread end
    },

    async down(queryInterface, Sequelize) {
        /**
         * Add commands to revert seed here.
         *
         * Example:
         * await queryInterface.bulkDelete('People', null, {});
         */
        return queryInterface.bulkDelete('master_city_list', null, {});
    }
};
