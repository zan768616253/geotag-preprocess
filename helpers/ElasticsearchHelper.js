const md5 = require('md5')
const fs = require('fs')
const readline = require('readline')
const stream = require('stream')

const ElasticsearchGeoTag  = require('../modules/elasticsearchGeoTag')
const config = require('../config')

class ElasticsearchHelper {

    constructor () {
        this.elasticsearchGeoTag = new ElasticsearchGeoTag()
    }

    insertDataToDOC (id, body) {
        const self = this
        return new Promise((resolve, reject) => {
            self.elasticsearchGeoTag.insert(self.elasticsearchGeoTag.DOC_INDEX, id, body)
                .then(r => {
                    resolve(r)
                }, e => {
                    reject(e)
                })
        })
    }

    updateGeotags (folder) {
        const self = this
        return new Promise((resolve, reject) => {
            const inStream = fs.createReadStream(folder || config.DEFAULT_TAGS_FOLDER)
            const outStream = new stream
            const rl = readline.createInterface(inStream, outStream)

            rl.on('line', line => {
                rl.pause();
                self.elasticsearchGeoTag.insert(self.elasticsearchGeoTag.GEOTAG_INDEX, md5(line), { tag: line }).then(() => {
                    console.log('done ' + line)
                    rl.resume();
                })
            })

            rl.on('close', () => {
                console.log('close')
                resolve(true)
            })

            rl.on('error', err => {
                reject(err.message)
            })
        })
    }
}

module.exports = ElasticsearchHelper