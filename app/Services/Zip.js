const { createGzip, createUnzip } = require('node:zlib')
const { pipeline } = require('stream')
const asyncStream = require('stream/promises')
const {
  createReadStream,
  createWriteStream,
} = require('fs')

class Zip {
  static pack(source, destination) {
    const gzip = createGzip()
    const _source = createReadStream(source)
    const _destination = createWriteStream(destination)

    pipeline(_source, gzip, _destination, (err) => {
      if (err) {
        console.error('An error occurred:', err)
        process.exitCode = 1
      }
    });
  }

  static async packAsync(source, destination) {
    const gzip = createGzip()
    const _source = createReadStream(source)
    const _destination = createWriteStream(destination)

    await asyncStream.pipeline(_source, gzip, _destination)

    return _destination
  }

  static unpack(source, destination) {
    const unzip = createUnzip()
    const _source = createReadStream(source)
    const _destination = createWriteStream(destination)

    pipeline(_source, unzip, _destination, (err) => {
      if (err) {
        console.error('An error occurred:', err)
        process.exitCode = 1
      }
    });
  }

  static async unpackAsync(source, destination) {
    const unzip = createUnzip()
    const _source = createReadStream(source)
    const _destination = createWriteStream(destination)

    await asyncStream.pipeline(_source, unzip, _destination)

    return _destination
  }

  static unpackStream(source, streamPipeTo) {
    const unzip = createUnzip()
    const _source = createReadStream(source)

    pipeline(_source, unzip, streamPipeTo)
  }

  static *unpackGenerator(source) {
    const unzip = createUnzip()
    const _source = createReadStream(source)
    
    pipeline(_source, unzip)

    for(const data in unzip) {
      yield data
    }
  }
}

module.exports = Zip
