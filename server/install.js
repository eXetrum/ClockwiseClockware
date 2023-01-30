const cfg = require('./config');
const { pool, execQuery } = require('./db');

function Install() {
	try {
		
		const tables = [
			`CREATE TABLE clients (
				id serial PRIMARY KEY,
				name VARCHAR ( 255 ) NOT NULL,
				email VARCHAR ( 255 ) UNIQUE NOT NULL
			);`, 
			`CREATE TABLE masters (
				id serial PRIMARY KEY,
				name VARCHAR ( 255 ) NOT NULL,	
				email VARCHAR ( 255 ) UNIQUE NOT NULL,	
				rating INTEGER NOT NULL
			);`,
			`CREATE TABLE admins (
				id serial PRIMARY KEY,
				email VARCHAR ( 255 ) UNIQUE NOT NULL,
				password VARCHAR ( 255 ) NOT NULL
			);`,
			`CREATE TABLE cities (
				id serial PRIMARY KEY,
				name VARCHAR ( 255 ) NOT NULL
			);`,
			`CREATE TABLE items (
				id serial PRIMARY KEY,
				name VARCHAR ( 255 ) NOT NULL,
				repair_time INTEGER NOT NULL
			);`,
			`CREATE TABLE booking (
				id serial PRIMARY KEY,
				client_id INT NOT NULL,
				item_id INT NOT NULL,
				city_id INT NOT NULL,
				master_id INT NOT NULL,
				datetime DATE NOT NULL,
				
				CONSTRAINT FK_client_id
					FOREIGN KEY(client_id)
					REFERENCES clients(id),
					
				CONSTRAINT FK_item_id
					FOREIGN KEY(item_id)
					REFERENCES items(id),
				
				CONSTRAINT FK_city_id
					FOREIGN KEY(city_id)
					REFERENCES cities(id),
					
				CONSTRAINT FK_master_id
					FOREIGN KEY(master_id)
					REFERENCES masters(id)
			);`
		];
		
		
		
		console.log('CREATE TABLES');
		tables.forEach( code => {
			console.log(code);
			execQuery(code);
		});
	
		console.log('INSERT DEFAULT VALUES');
		execQuery('INSERT INTO admins (email, password) VALUES($1, $2)', ['admin@example.com', 'passwordsecret']);
		execQuery('INSERT INTO cities (name) VALUES ($1), ($2)', ['Дніпро', 'Ужгород']);
		
	} catch(e) { console.error(e); }

}

Install();

