'use strict';
const uuid = require('uuid');
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
	class Client extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		*/
		static associate(models) {
			// define association here
			Client.hasMany(models.Order, {
				foreignKey: 'clientId',
				as: 'orders'
			});
		}
	}
	
	Client.init({
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
			allowNull: true,
			type: DataTypes.STRING
		},
		name: {
			allowNull: false,
			type: DataTypes.STRING
		},
	}, {
		sequelize,
		modelName: 'Client',
		tableName: 'clients',
		associations: true,
	});
	
	return Client;
};