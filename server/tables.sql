CREATE TABLE clients (
	id serial PRIMARY KEY,
	name VARCHAR ( 255 ) NOT NULL,
	email VARCHAR ( 255 ) UNIQUE NOT NULL
);

CREATE TABLE masters (
	id serial PRIMARY KEY,
	name VARCHAR ( 255 ) NOT NULL,	
	email VARCHAR ( 255 ) UNIQUE NOT NULL,	
	rating INTEGER NOT NULL
);

CREATE TABLE admins (
	id serial PRIMARY KEY,
	email VARCHAR ( 255 ) UNIQUE NOT NULL,
	name VARCHAR ( 255 ) NOT NULL,
	password VARCHAR ( 255 ) NOT NULL
);

CREATE TABLE cities (
	id serial PRIMARY KEY,
	name VARCHAR ( 255 ) NOT NULL
);

CREATE TABLE items (
	id serial PRIMARY KEY,
	name VARCHAR ( 255 ) NOT NULL,
	repair_time INTEGER NOT NULL
);

CREATE TABLE booking (
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
);