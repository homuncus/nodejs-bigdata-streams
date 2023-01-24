const { createGzip } = require('zlib')
const { createReadStream, createWriteStream } = require('fs')
const { pipeline, finished } = require('stream/promises')
const stream = require('stream')

const productNames = 'Lasagna Pizza Sushi TV Basketball N-word_pass Amogus Notebook Mouse Duck Headphones Gamepad Computer Lamp Generator'.split(' ')

// Creates a Zip-file with 2 GiB json in it
async function generate(path) {
  const writeStream = createWriteStream(path + '.json')
  const size = Math.pow(2, 31)
  var itemId = 1, i = 0
  // one iteration makes approx. 16KB chunk of data
  const iterCount = Math.pow(2, 31) / (1024 * 16)

  writeStream.on('error', (err) => {
    console.log(err);
  })

  writeStream.write('[')
  await write()

  async function write() {
    var ok = true
    while (iterCount > i) {
      let item = `{"id":"${itemId++}","name":"${productNames[Math.floor(Math.random() * (productNames.length - 1))]}","cost":"${Math.floor(Math.random() * 1000)}"}`

      if (iterCount <= i) {
        //last time
        writeStream.write(item + ']')
        break;
      } else {
        ok = writeStream.write(item + ',')
      }

      if(!ok) {
        await new Promise(resolve => writeStream.once('drain', resolve))
        i++
        ok = !ok
      }

    }

    // if (i < iterCount) {
    //   writeStream.once('drain', write)
    // }

  }

  await finished(writeStream);
  return writeStream.path.toString()
}

console.log('File started generating, please wait!')

generate('items')
  .then(() => {
    console.log('File was successfully generated!');
  })
  .catch((err) => {
    console.error('Error: ', err.message);
  })
