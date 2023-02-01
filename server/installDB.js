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
		DROP TABLE IF EXISTS items;
			
		CREATE TABLE cities (
			city_id serial PRIMARY KEY,
			city_name VARCHAR ( 255 ) NOT NULL
		);
		
		CREATE TABLE items (
			item_id serial PRIMARY KEY,
			item_name VARCHAR ( 255 ) NOT NULL,
			item_repair_time INTEGER NOT NULL
		);
		CREATE TABLE clients (
			client_id serial PRIMARY KEY,
			client_name VARCHAR ( 255 ) NOT NULL,
			client_email VARCHAR ( 255 ) UNIQUE NOT NULL
		);
		CREATE TABLE admins (
			admin_id serial PRIMARY KEY,
			admin_email VARCHAR ( 255 ) UNIQUE NOT NULL,
			admin_password VARCHAR ( 255 ) NOT NULL
		);
		CREATE TABLE masters (
			master_id serial PRIMARY KEY,
			master_name VARCHAR ( 255 ) NOT NULL,	
			master_email VARCHAR ( 255 ) UNIQUE NOT NULL,	
			master_rating INTEGER NOT NULL
		);
		CREATE TABLE master_city_list (
			id serial PRIMARY KEY,
			master_id INTEGER NOT NULL,
			city_id INTEGER NOT NULL,
			FOREIGN KEY(master_id) REFERENCES masters(master_id) ON DELETE CASCADE ON UPDATE CASCADE,
			FOREIGN KEY(city_id) REFERENCES cities(city_id) ON DELETE CASCADE ON UPDATE CASCADE
		);
		CREATE TABLE booking (
			booking_id serial PRIMARY KEY,
			client_id INT NOT NULL,
			item_id INT NOT NULL,
			city_id INT NOT NULL,
			master_id INT NOT NULL,
			datetime DATE NOT NULL,
			FOREIGN KEY(client_id) REFERENCES clients(client_id),
			FOREIGN KEY(item_id) REFERENCES items(item_id),
			FOREIGN KEY(city_id) REFERENCES cities(city_id),
			FOREIGN KEY(master_id) REFERENCES masters(master_id)
		);
		INSERT INTO cities (city_name) VALUES ('Дніпро'), ('Ужгород');
		INSERT INTO items (item_name, item_repair_time) VALUES ('Маленький', 1), ('Середній', 2), ('Великий', 3);
		INSERT INTO admins (admin_email, admin_password) VALUES('admin@example.com', 'passwordsecret');
		INSERT INTO masters (master_name, master_email, master_rating) VALUES 
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
