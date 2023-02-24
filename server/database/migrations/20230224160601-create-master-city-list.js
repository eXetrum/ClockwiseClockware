'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('master_city_list', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER
			},
			masterId: {
				allowNull: false,
				type: Sequelize.UUID,
				references: {
					model: 'masters',
					key: 'id'
				},
				onDelete: 'RESTRICT'
			},
			cityId: {
				allowNull: false,
				type: Sequelize.UUID,
				references: {
					model: 'cities',
					key: 'id'
				},
				onDelete: 'RESTRICT'
			},
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE
			}
		});
	},
	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable('master_city_list');
	}
};