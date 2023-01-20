const fs = require('fs')
const Helpers = use('Helpers')
const { faker } = require('@faker-js/faker')
const StreamArray = require('stream-json/streamers/StreamArray')
const Stream = require('stream/promises')
const { promisify } = require('util')

class ItemJSON {
  constructor(path) {
    this._pathSpecified = true
    if (!path) {
      path = Helpers.tmpPath(`${Date.now()}`)
      this._pathSpecified = false
    }
    if (path.split('.').at(-1) !== 'json')
      path += '.json'
    this.path = path
  }

  /**
   * Generates a json array of store items on `this.path` path
   * @param {number} size - size of a file to be generated
   * @default size = Math.pow(2, 31) // 2 GiB
   * @returns {string} generated file\`s path
   */
  generate(size = Math.pow(2, 31)) {
    const stream = fs.createWriteStream(this.path)
    var itemId = 0, i = 0
    // console.log(size);
    // one iteration makes approx. 16KB chunk of data
    const iterCount = size / (1024 * 16)
    // console.log(iterCount);

    stream.on('error', (err) => {
      console.log(err);
    })

    stream.write('[')
    write()

    function write() {
      var ok = true
      while (i <= iterCount && ok) {
        let item = `{"uuid":"${faker.datatype.uuid()}","name":"${faker.commerce.product()}","cost":"${faker.datatype.number(1000)}"}`

        if (i === iterCount) {
          //last time
          stream.write(item + ']')
        } else {
          ok = stream.write(item + ',')
        }
      }

      if (i < iterCount) {
        stream.once('drain', write)
      }

      i++
    }

    console.log('File started generating, please wait!')
    return stream.path.toString()
  }

  read() {
    if (!this._pathSpecified) {
      throw new Error('Path of readable json file must be specified upon creation of ItemJSON object')
    }

    return ItemJSON.read(this.path)
  }

  static read(path) {
    if (!path) throw new Error('No path provided')
    if (path.split('.').at(-1) !== 'json') {
      throw new Error('Invalid file type')
    }

    // var buf = '';
    // const data = []

    // stream.on('data', function (d) {
    //   buf += d.toString();
    //   for (const value of pump()) {  // process the buffer
    //     data.push(value)
    //   }
    // });

    // function *pump() {
    //   var pos;

    //   while ((pos = buf.indexOf('\n')) >= 0) {
    //     if (pos == 0) {
    //       buf = buf.slice(1);
    //       continue;
    //     }
    //     yield processLine(buf.slice(0, pos));
    //     buf = buf.slice(pos + 1); // slice the processed data off the buffer
    //   }
    // }

    // function processLine(line) {
    //   if (line[line.length - 1] == '\r') line = line.substr(0, line.length - 1); // discard CR (0x0D)

    //   if (line.length > 0) {
    //     var obj = JSON.parse(line);
    //     return obj
    //   }
    // }
    const jsonStream = StreamArray.withParser();

    fs.createReadStream(path).pipe(jsonStream.input);

    jsonStream.on('error', (err) => {
      console.log(err.message);
    });

    return jsonStream
  }

  static pipe(readStream) {
    const jsonStream = StreamArray.withParser();

    readStream.pipe(jsonStream.input);

    jsonStream.on('error', (err) => {
      console.log(err.message);
    });

    return jsonStream
  }

  /**
   * Generator method that searches for all objects in `this.path` file
   * matching the `object.attribute == val` condition. 
   * @param {string} attribute
   * @param {string} val
   * @param {number} n - maximum number of objects per one `next()` call to return.
   * @method next() - returns next array of `n` objects.
   * @returns {Generator} Array generator.
   */
  async *findBy(attribute, val, n = 10) {
    const stream = this.read()
    const result = []

    // stream.on('data', ({ key, value }) => {
    //   if (value[`${attribute}`].toLowerCase() == val.toLowerCase()) {
    //     result.push(value)
    //     console.log(value);
    //   }
    // });

    for await (const data of stream) {
      const { value } = data
      if (value[`${attribute}`].toLowerCase() == val.toLowerCase()) {
        result.push(value)
        if (result.length >= n) {
          yield result
          result = []
        }
      }
    }

    return result
  }
}

module.exports = ItemJSON
