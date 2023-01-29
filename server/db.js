const { Pool} = require('pg')

const pool = new Pool({
  user: 'postgres',
  database: 'ClockwiseClockware',
  password: 'postgres',
  port: 5432,
  host: 'localhost',
})