const md5 = require('md5')
const fs = require('fs')

const ElasticsearchGeoTag  = require('../modules/elasticsearchGeoTag')
const config = require('../config')
const LineByLineReader = require('../modules/line-by-line')

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
            const lr = new LineByLineReader(fs.createReadStream(folder || config.DEFAULT_TAGS_File))

            lr.on('error', function (err) {
                reject(err.message)
            });

            lr.on('line', function (line) {
                lr.pause();
                self.elasticsearchGeoTag.insert(self.elasticsearchGeoTag.GEOTAG_INDEX, md5(line), { tag: line }).then(() => {
                    console.log('done ' + line)
                    lr.resume()
                })
            });

            lr.on('end', function () {
                console.log('close')
                resolve(true)
            });
        })
    }

    getDocIdByQueryTag () {

    }

    updateDocumentWithTag (tag) {
        return new Promise((resolve, reject) => {
            const query = {
                "match_phrase": {
                    "content": tag
                }
            }
            const body = {
                "query": query,
                "script": {
                    "inline": "ctx._source.tags.add(params.hits)",
                    "params": {"hits": tag}
                }
            }
            this.elasticsearchGeoTag.update(self.elasticsearchGeoTag.DOC_INDEX, body)
                .then(r => {
                    resolve(r)
                }, e => {
                    reject(e)
                })
        })
    }
}

module.exports = ElasticsearchHelper