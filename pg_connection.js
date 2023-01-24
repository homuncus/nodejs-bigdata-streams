require('dotenv').config();
const pg = require('pg')

const env = process.env
const client = new pg.Client({
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_DATABASE,
  host: env.DB_HOST,
  port: env.DB_PORT
})

client.connect()
  .then(() => {
    console.log('Connected to database');
  })
  .catch((err) => {
    console.error('Error: ', err.message);
  })

module.exports = client
