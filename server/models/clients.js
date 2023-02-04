const { execQuery } = require('./db');

const getClients = async () => {
	console.log('[db] getClients');
	let result = await execQuery('SELECT * FROM clients');
	console.log('[db] getClients result: ', result.rows);
	return result.rows;
};

const deleteClientById = async (id) => {
	console.log('[db] deleteClientById ', id);
	// TODO
};

const getClientById = async (id) => {
	console.log('[db] getClientById ', id);
	// TODO
};

const updateClientById = async (id, client) => {
	console.log('[db] updateClientById ', id);
	// TODO
};

module.exports = { getClients, deleteClientById, getClientById, updateClientById };