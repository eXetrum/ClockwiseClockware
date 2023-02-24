const { execQuery } = require('./db');

const getUser = async (email, password) => {
	console.log('[db] getUser: ', email, password);
	if(!email || !password) return null;
	let result = await execQuery('SELECT * FROM admins WHERE email=$1 AND password=$2 LIMIT 1', [email, password]);
	console.log('[db] getUser result: ', result.rows);
	if(result.rows == []) return null;
	return result.rows[0];
};

module.exports = { getUser };

  