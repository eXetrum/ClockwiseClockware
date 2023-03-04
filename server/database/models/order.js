'use strict';
const uuid = require('uuid');
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Order extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Order.belongsTo(models.Client, { as: 'client', foreignKey: 'clientId' });
            Order.belongsTo(models.Watches, { as: 'watch', foreignKey: 'watchId' });
            Order.belongsTo(models.City, { as: 'city', foreignKey: 'cityId' });
            Order.belongsTo(models.Master, { as: 'master', foreignKey: 'masterId' });
        }
    }

    Order.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                allowNull: false,
                primaryKey: true
            },
            clientId: {
                allowNull: false,
                type: DataTypes.UUID,
                references: {
                    model: 'clients',
                    key: 'id'
                },
                onDelete: 'RESTRICT'
            },
            watchId: {
                allowNull: false,
                type: DataTypes.UUID,
                references: {
                    model: 'watches',
                    key: 'id'
                },
                onDelete: 'RESTRICT'
            },
            cityId: {
                allowNull: false,
                type: DataTypes.UUID,
                references: {
                    model: 'cities',
                    key: 'id'
                },
                onDelete: 'RESTRICT'
            },
            masterId: {
                allowNull: false,
                type: DataTypes.UUID,
                references: {
                    model: 'masters',
                    key: 'id'
                },
                onDelete: 'RESTRICT'
            },
            startDate: {
                type: DataTypes.DATE,
                allowNull: false
            },
            endDate: {
                type: DataTypes.DATE,
                allowNull: false
                // allowNull: true,
            }
        },
        {
            sequelize,
            modelName: 'Order',
            tableName: 'orders',
            associations: true
            /* validate: {
			bothCoordsOrNone() {
				if ((this.startDate === null) !== (this.longitude === null)) {
				throw new Error('Either both latitude and longitude, or neither!');
				}
			}
		} */
        }
    );

    return Order;
};
/*
CREATE TABLE orders (
	id serial PRIMARY KEY,
	client_id INT NOT NULL,
	watch_type_id INT NOT NULL,
	city_id INT NOT NULL,
	master_id INT NOT NULL,

	start_date timestamp NOT NULL,
	end_date timestamp NOT NULL,

	FOREIGN KEY(client_id) REFERENCES clients(id) ON DELETE RESTRICT,
	FOREIGN KEY(watch_type_id) REFERENCES watch_type(id) ON DELETE RESTRICT,
	FOREIGN KEY(city_id) REFERENCES cities(id) ON DELETE RESTRICT,
	FOREIGN KEY(master_id) REFERENCES masters(id) ON DELETE RESTRICT,

	CONSTRAINT start_date_less_than_end_date CHECK (start_date < end_date),
	CONSTRAINT overlapping_times EXCLUDE USING GIST (
		master_id WITH =,
		box(point(EXTRACT(EPOCH FROM start_date) + 1, 0),
			point(EXTRACT(EPOCH FROM end_date) - 1,   0)) WITH &&
	)
);
*/
