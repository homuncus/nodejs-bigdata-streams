/** @type {typeof import('@adonisjs/../../app/Services/ItemJSON')} */
const ItemJSON = use('App/Services/ItemJSON')
/** @type {typeof import('@adonisjs/../../app/Services/Zip')} */
const Zip = use('App/Services/Zip')
/** @type {typeof import('@adonisjs/../../app/Services/ItemDB')} */
const ItemDB = use('App/Services/ItemDB')

const Helpers = use('Helpers')
const path = require('path')

class ItemController {
  async generate({ request, response }) {
    var { size, unit, fileName, wait } = request.all()
    if (fileName) fileName += fileName.split('.').at(-1) !== 'json' ? '.json' : ''
    if (!unit) unit = 'b'
    const unitSizes = {
      b: 1,
      kb: 1024,
      mb: Math.pow(1024, 2),
      gb: Math.pow(1024, 3)
    }
    var generator = new ItemJSON(fileName ? Helpers.tmpPath(fileName) : '')
    return { path: generator.generate(size * unitSizes[`${unit}`]) }
  }

  async read({ params, request, response }) {
    var { fileName, attr, value } = request.all()

    if(typeof value === 'string') value = value.toLowerCase()
    fileName += fileName.split('.').at(-1) !== 'json' ? '.json' : ''

    const finder = new ItemJSON(Helpers.tmpPath(fileName))

    return { data: (await finder.findBy(attr, value).next()).value }
  }

  async pack({ request }) {
    const {
      sourceName,
      destinationName,
      wait
    } = request.all()
    
    if(wait) {
      const resultStream = await Zip.packAsync(Helpers.tmpPath(sourceName + '.json'), Helpers.tmpPath(destinationName + '.zip'))
      return { message: 'File was successfully zip-packed!', stream: resultStream }
    }
    Zip.pack(Helpers.tmpPath(sourceName + '.json'), Helpers.tmpPath(destinationName + '.zip'))
    return { message: 'File is being zip-packed!' }
  }

  async unpack({ request }) {
    const {
      sourceName,
      destinationName,
      wait
    } = request.all()
    
    if(wait) {
      const resultStream = await Zip.unpackAsync(Helpers.tmpPath(sourceName + '.zip'), Helpers.tmpPath(destinationName + '.json'))
      return { message: 'File was successfully unpacked!', stream: resultStream }
    }
    Zip.unpack(Helpers.tmpPath(sourceName + '.zip'), Helpers.tmpPath(destinationName + '.json'))
    return { message: 'File is being unpacked!' }
  }

  async store({ request }) {
    const { fileName, wait } = request.all()
    if(wait) {
      let stream = await new ItemDB()
        .fromJson(Helpers.tmpPath(fileName + '.json'))
        .push()
      return { message: 'Data has been pushed to database!', stream }
    }
    new ItemDB()
      .fromJson(Helpers.tmpPath(fileName + '.json'))
      .push()
    return { message: 'Data is being pushed to database!' }
  }
}

module.exports = ItemController
