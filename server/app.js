require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const app = express();
const port = process.env.NODE_APP_PORT || 4200;

app.use(morgan('dev'));
app.use(cors({ origin: '*' }));
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));

app.use('/api', require('./routes/auth'));
app.use('/api', require('./routes/cities'));
app.use('/api', require('./routes/watches'));
app.use('/api', require('./routes/masters'));
app.use('/api', require('./routes/clients'));
app.use('/api', require('./routes/orders'));

app.listen(port, () => {
    // eslint-disable-next-line
    console.log(`Server App listening on port ${port}`);
});

module.exports = app;
