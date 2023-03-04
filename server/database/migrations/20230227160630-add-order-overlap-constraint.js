/* eslint-disable no-tabs */
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.sequelize.query(`
			ALTER TABLE orders
			ADD CONSTRAINT overlapping_times EXCLUDE USING GIST (
				"masterId" WITH =,
				box(point(EXTRACT(EPOCH FROM "startDate" at time zone 'UTC') + 1, 0), 
					point(EXTRACT(EPOCH FROM "endDate" at time zone 'UTC') - 1,   0)) WITH &&
			);
		`);
    },

    async down(queryInterface, Sequelize) {
        return queryInterface.sequelize.query('ALTER TABLE orders DROP CONSTRAINT overlapping_times;');
    }
};
