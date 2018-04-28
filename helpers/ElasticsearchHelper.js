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
        const self = this
        return new Promise((resolve, reject) => {
            const body = {
                query: {
                    "match_all": {}
                }
            }

            self.elasticsearchGeoTag.scrollQuery(self.elasticsearchGeoTag.GEOTAG_INDEX, body, self.updateDocumentWithTag.bind(self))
                .then(r => {
                    resolve(r)
                }, e => {
                    reject(e)
                })
        })
    }

    updateDocumentWithTag (doc) {
        const self = this
        return new Promise((resolve, reject) => {
            const query = {
                "match_phrase": {
                    "content": doc._source.tag
                }
            }
            const body = {
                "query": query,
                "script": {
                    "inline": "if (ctx._source.tags != null) {if (!ctx._source.tags.contains(params.hits)) {ctx._source.tags.add(params.hits)}} else {ctx._source.tags = [params.hits]}",
                    "params": {"hits": doc._source.tag}
                }
            }
            self.elasticsearchGeoTag.update(self.elasticsearchGeoTag.DOC_INDEX, body)
                .then(r => {
                    resolve(r)
                }, e => {
                    reject(e)
                })
        })
    }
}

module.exports = ElasticsearchHelper