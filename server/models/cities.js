const { execQuery } = require('./db');

const getCities = async () => {
	console.log('[db] getCities');
	let result = await execQuery('SELECT * FROM cities');
	console.log('[db] getCities result: ', result.rows);
	return result.rows;
};

const createCity = async (cityName) => {
	console.log('[db] createCity: ', cityName);
	await execQuery('INSERT INTO cities (name) VALUES ($1);', [cityName]);
	let result = await execQuery('SELECT * FROM cities');
	console.log('[db] createCity result: ', result.rows);
	return result.rows;
};

const deleteCityById = async (id) => {
	console.log('[db] deleteCityById: ', id);
	let result = await execQuery('DELETE FROM cities WHERE id=($1);', [id]);
	console.log('[db] deleteCityById result: ', result.rows);
	return result.rows;
};

const getCityById = async (id) => {
	console.log('[db] getCityById: ', id);
	let result = await execQuery('SELECT * FROM cities WHERE id=($1);', [id]);
	console.log('[db] getCityById result: ', result.rows);
	return result.rows;
};

const updateCityById = async (id, cityName) => {
	console.log('[db] updateCityById: ', id, cityName);
	let result = await execQuery('UPDATE cities SET name=$1 WHERE id=($2);', [cityName, id]);
	console.log('[db] updateCityById result: ', result.rows);
	return result.rows;
};

module.exports = { getCities, createCity, deleteCityById, getCityById, updateCityById };