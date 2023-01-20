const Item = use('App/Models/Item')
const ItemJSON = use('App/Services/ItemJSON')

const Sources = {
  NONE: '',
  STREAM: 'stream',
  JSON: 'json'
}

class ItemDB {
  constructor (/* path */) {
    // this.path = path
    this._source = Sources.NONE
  }

  fromJson(path) {
    this._source = Sources.JSON
    this.resourceStream = ItemJSON.read(path)
    return this
  }

  fromStream(stream) {
    this._source = Sources.STREAM
    this.resourceStream = ItemJSON.pipe(stream)
    return this
  }

  // this.resourceStream must be an instance of Chain from stream-json
  async push() {
    if(this._source === Sources.NONE) {
      throw new Error(`Chain one of the 'from-' source methods!`)
    }

    for await (const { value } of this.resourceStream) {
      await Item.create({
        id: value.uuid,
        name: value.name,
        cost: parseInt(value.cost)
      })
    }

    return this.resourceStream.output
  }
}

module.exports = ItemDB
