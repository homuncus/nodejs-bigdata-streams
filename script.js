const { createGunzip, unzip } = require('zlib')
const { createReadStream, createWriteStream } = require('fs')
const client = require('./pg_connection')

const stream = require('stream')
const { chain } = require('stream-chain')
const StreamArray = require('stream-json/streamers/StreamArray')
const { parser } = require('stream-json')
const { streamValues } = require('stream-json/streamers/StreamValues');

function pushInDb(fileName) {
  const unzip = createGunzip()
  const readStream = createReadStream(`${__dirname}/${fileName}`)
  // const writeStream = createWriteStream(`${__dirname}/${fileName}.json`)
  const jsonStream = StreamArray.withParser()
  const BUFFER_LIMIT = 10000

  var i = 0,
    buffer = '',
    headerCut = false

  const pipeline = chain([
    readStream,
    unzip,
    // cut off the header of file
    (data) => {
      if (data.indexOf('[') > 0 && !headerCut) {
        headerCut = true
        return data.subarray(data.indexOf('['))
      }
      return data
    },
    jsonStream,
    async ({ value: item }) => {
      buffer += `('${item.name}','${item.cost}')`
      if (++i === BUFFER_LIMIT) {
        await client.query(`INSERT INTO streams_items(name, cost) VALUES ${buffer}`)
        i = 0
        buffer = ''
      } else {
        buffer += ','
      }
      return null
    }
  ])

  pipeline.on('end', () => {
    if (i < BUFFER_LIMIT) {
      client.query(`INSERT INTO streams_items(name, cost) VALUES ${buffer}`)
    }
    console.log('Items were successfully pushed to db!');
  })

  pipeline.on('error', (err) => {
    console.error('Chain error: ', err);
  })
}

console.log('Items are being pushed to db!');
pushInDb('data/items.json.gz')