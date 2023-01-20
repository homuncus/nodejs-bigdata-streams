/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ItemSchema extends Schema {
  up () {
    this.create('items', (table) => {
      table.uuid('id', { primaryKey: true })
      table.string('name').notNullable()
      table.integer('cost').notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('items')
  }
}

module.exports = ItemSchema
