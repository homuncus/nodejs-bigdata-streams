const client = require('./pg_connection')

async function migrate() {
  await client.query(
    `CREATE TABLE IF NOT EXISTS streams_items (
      id SERIAL PRIMARY KEY,
      name VARCHAR(50) NOT NULL,
      cost INTEGER NOT NULL
    );`)
}

migrate()
  .then(() => {
    console.log('Successfully migrated the table!');
  })
  .catch((err) => {
    console.error('Error: ', err.message);
  })
