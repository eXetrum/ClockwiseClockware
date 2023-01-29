const express = require('express')
const app = express()
const port = process.env.PORT || 3000

const { pool } = require("./db");

app.get('/', (req, res) => {
	res.send('Hello World!');
	//pool
})

app.listen(port, () => {
	console.log(`Server App listening on port ${port}`)
})