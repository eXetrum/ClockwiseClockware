require('dotenv').config();
const { pool } = require('./db');


const install = async () => {
	console.log('CREATE TABLES');
	return pool.query(`
		DROP TABLE IF EXISTS booking;
		DROP TABLE IF EXISTS masters;
		DROP TABLE IF EXISTS admins;
		DROP TABLE IF EXISTS clients;
		DROP TABLE IF EXISTS cities;
		DROP TABLE IF EXISTS items;
			
		CREATE TABLE cities (
			id serial PRIMARY KEY,
			name VARCHAR ( 255 ) NOT NULL
		);
		
		CREATE TABLE items (
			id serial PRIMARY KEY,
			name VARCHAR ( 255 ) NOT NULL,
			repair_time INTEGER NOT NULL
		);
		CREATE TABLE clients (
			id serial PRIMARY KEY,
			name VARCHAR ( 255 ) NOT NULL,
			email VARCHAR ( 255 ) UNIQUE NOT NULL
		);
		CREATE TABLE admins (
			id serial PRIMARY KEY,
			email VARCHAR ( 255 ) UNIQUE NOT NULL,
			password VARCHAR ( 255 ) NOT NULL
		);
		CREATE TABLE masters (
			id serial PRIMARY KEY,
			name VARCHAR ( 255 ) NOT NULL,	
			email VARCHAR ( 255 ) UNIQUE NOT NULL,	
			rating INTEGER NOT NULL,
			city_id INTEGER NOT NULL,
			FOREIGN KEY(city_id) REFERENCES cities(id)
		);
		CREATE TABLE booking (
			id serial PRIMARY KEY,
			client_id INT NOT NULL,
			item_id INT NOT NULL,
			city_id INT NOT NULL,
			master_id INT NOT NULL,
			datetime DATE NOT NULL,
			FOREIGN KEY(client_id) REFERENCES clients(id),
			FOREIGN KEY(item_id) REFERENCES items(id),
			FOREIGN KEY(city_id) REFERENCES cities(id),
			FOREIGN KEY(master_id) REFERENCES masters(id)
		);
		INSERT INTO cities (name) VALUES ('Дніпро'), ('Ужгород');
		INSERT INTO items (name, repair_time) VALUES ('Маленький', 1), ('Середній', 2), ('Великий', 3);
		INSERT INTO admins (email, password) VALUES('admin@example.com', 'passwordsecret');
		INSERT INTO masters (name, email, rating, city_id) VALUES 
			('MasterDp1', 'master1@dp.ua', 5, 1),
			('MasterDp2', 'master2@dp.ua', 4, 1),
			('MasterUz1', 'master1@uz.ua', 5, 2);
		`
	);
};


install();
