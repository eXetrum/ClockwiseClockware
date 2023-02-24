'use strict';
const uuid = require('uuid');
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
	class Master extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		*/
		static associate(models) {
			// define association here
			Master.belongsToMany(models.City, {
				through: models.MasterCityList,
				as: "cities",
				foreignKey: "masterId",
			});
		}
	}
	
	Master.init({
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
			primaryKey: true,
		},
		email: {
			allowNull: false,
			unique: true,
			type: DataTypes.STRING
		},
		password: {
			allowNull: false,
			type: DataTypes.STRING
		},
		name: {
			allowNull: false,
			type: DataTypes.STRING
		},
		rating: {
			allowNull: false,
			type: DataTypes.INTEGER
		},
	}, {
		sequelize,
		modelName: 'Master',
		tableName: 'masters',
		associations: true,
	});
	
	return Master;
};

/*FOREIGN KEY(master_id) REFERENCES masters(id) ON DELETE RESTRICT,
	FOREIGN KEY(city_id) REFERENCES cities(id) ON DELETE RESTRICT*/