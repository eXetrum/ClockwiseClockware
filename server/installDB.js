require('dotenv').config();
const { pool } = require('./db');


const install = async () => {
	console.log('CREATE TABLES');
	return pool.query(`
		DROP TABLE IF EXISTS booking;
		DROP TABLE IF EXISTS master_city_list;
		DROP TABLE IF EXISTS masters;		
		DROP TABLE IF EXISTS admins;
		DROP TABLE IF EXISTS clients;
		DROP TABLE IF EXISTS cities;
		DROP TABLE IF EXISTS watch_type;
			
		CREATE TABLE cities (
			id serial PRIMARY KEY,
			name VARCHAR ( 255 ) NOT NULL
		);
		
		CREATE TABLE watch_type (
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
			rating INTEGER NOT NULL
		);
		CREATE TABLE master_city_list (
			id serial PRIMARY KEY,
			master_id INTEGER NOT NULL,
			city_id INTEGER NOT NULL,
			FOREIGN KEY(master_id) REFERENCES masters(id) ON DELETE CASCADE ON UPDATE CASCADE,
			FOREIGN KEY(city_id) REFERENCES cities(id) ON DELETE CASCADE ON UPDATE CASCADE
		);
		CREATE TABLE booking (
			id serial PRIMARY KEY,
			client_id INT NOT NULL,
			watch_type_id INT NOT NULL,
			city_id INT NOT NULL,
			master_id INT NOT NULL,
			datetime DATE NOT NULL,
			FOREIGN KEY(client_id) REFERENCES clients(id),
			FOREIGN KEY(watch_type_id) REFERENCES watch_type(id),
			FOREIGN KEY(city_id) REFERENCES cities(id),
			FOREIGN KEY(master_id) REFERENCES masters(id)
		);
		INSERT INTO cities (name) VALUES ('Дніпро'), ('Ужгород');
		INSERT INTO watch_type (name, repair_time) VALUES ('Маленький', 1), ('Середній', 2), ('Великий', 3);
		INSERT INTO admins (email, password) VALUES('admin@example.com', 'passwordsecret');
		INSERT INTO masters (name, email, rating) VALUES 
			('MasterDp1', 'master1@dp.ua', 5),
			('MasterDp2', 'master2@dp.ua', 4),
			('MasterUz1', 'master1@uz.ua', 5);
		
		INSERT INTO master_city_list (master_id, city_id) VALUES
			(1, 1),
			(1, 2),
			(2, 1),
			(3, 2)
		`
	);
};


install();
