const co = require('co')
const fs = require('fs')
const readline = require('readline')
const stream = require('stream')

const ElasticsearchGeoTag  = require('../modules/elasticsearchGeoTag')
const config = require('../config')

class ElasticsearchHelper {

    constructor () {
        this.elasticsearchGeoTag = new ElasticsearchGeoTag()
    }

    insertDataToES (body) {
        const self = this
        return new Promise((resolve, reject) => {
            self.elasticsearchGeoTag.insert(self.elasticsearchGeoTag.DOC_TYPE, body)
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
                self.elasticsearchGeoTag.insert(self.elasticsearchGeoTag.GEOTAG_TYPE, { tag: line })
            })

            rl.on('close', () => {
                resolve(true)
            })

            rl.on('error', err => {
                reject(err.message)
            })
        })
    }
}

module.exports = ElasticsearchHelper