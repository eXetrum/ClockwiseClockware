require('dotenv').config();

const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const app = express()

const port = process.env.PORT || 4200

//const { pool } = require("./db");
const routes = require('./routes');



app.use(morgan('dev'));
app.use(cors({
    origin: '*'
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(routes); 

app.listen(port, () => {
	console.log(`Server App listening on port ${port}`)
})

module.exports = app;