/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return Promise.all([
            queryInterface.bulkUpdate('cities', { name: 'Dnipro' }, { name: 'Дніпро' }),
            queryInterface.bulkUpdate('cities', { name: 'Uzhgorod' }, { name: 'Ужгород' }),

            queryInterface.bulkUpdate('watches', { name: 'Small' }, { name: 'Маленький' }),
            queryInterface.bulkUpdate('watches', { name: 'Mid' }, { name: 'Середній' }),
            queryInterface.bulkUpdate('watches', { name: 'Large' }, { name: 'Великий' })
        ]);
    },

    async down(queryInterface, Sequelize) {
        return Promise.all([
            queryInterface.bulkUpdate('cities', { name: 'Дніпро' }, { name: 'Dnipro' }),
            queryInterface.bulkUpdate('cities', { name: 'Ужгород' }, { name: 'Uzhgorod' }),

            queryInterface.bulkUpdate('watches', { name: 'Маленький' }, { name: 'Small' }),
            queryInterface.bulkUpdate('watches', { name: 'Середній' }, { name: 'Mid' }),
            queryInterface.bulkUpdate('watches', { name: 'Великий' }, { name: 'Large' })
        ]);
    }
};
