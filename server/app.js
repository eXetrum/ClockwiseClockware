require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const app = express()
const port = process.env.NODE_APP_PORT || 4200

app.use(morgan('dev'));
app.use(cors({ origin: '*' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api', require('./routes/admins'));
app.use('/api', require('./routes/cities'));
app.use('/api', require('./routes/watches'));
app.use('/api', require('./routes/masters'));
app.use('/api', require('./routes/clients'));
app.use('/api', require('./routes/orders'));

app.listen(port, () => {
	console.log(`Server App listening on port ${port}`)
})

module.exports = app;