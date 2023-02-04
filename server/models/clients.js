const { execQuery } = require('./db');

const getClients = async () => {
	console.log('[db] getClients');
	let result = await execQuery('SELECT * FROM clients ORDER BY id');
	console.log('[db] getClients result: ', result.rows);
	return result.rows;
};

const deleteClientById = async (id) => {
	console.log('[db] deleteClientById ', id);
	let result = await execQuery('DELETE FROM clients WHERE id=($1);', [id]);
	console.log('[db] deleteClientById result: ', result.rows);
	return result.rows;
};

const getClientById = async (id) => {
	console.log('[db] getClientById ', id);
	let result = await execQuery('SELECT * FROM clients WHERE id=($1);', [id]);
	console.log('[db] getClientById result: ', result.rows);
	return result.rows;
};

const updateClientById = async (id, client) => {
	console.log('[db] updateClientById ', id, client);
	let result = await execQuery('UPDATE clients SET name=$1, email=$2 WHERE id=($3);', [client.name, client.email, id]);
	console.log('[db] updateClientById result: ', result.rows);
	return result.rows;
};

module.exports = { getClients, deleteClientById, getClientById, updateClientById };