require('dotenv').config();

const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const app = express()

const port = process.env.NODE_APP_PORT || 4200

const admins = require('./routes/admins');
const cities = require('./routes/cities');
const masters = require('./routes/masters');
const orders = require('./routes/orders');
const clients = require('./routes/clients');


app.use(morgan('dev'));
app.use(cors({ 
    origin: '*'
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(admins); 
app.use(cities);
app.use(masters);
app.use(orders);
app.use(clients);

app.listen(port, () => {
	console.log(`Server App listening on port ${port}`)
})

module.exports = app;