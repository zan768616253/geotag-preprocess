const co = require('co')
const elasticsearch = require('elasticsearch')

const config = require('../config')

class ElasticsearchGeoTag{

    constructor () {
        this.elasticClient = new elasticsearch.Client({
            host: config.elasticsearch.host,
            log: config.elasticsearch.log
        })
        this.GEOTAG_INDEX = 'geotag'
        this.DOC_INDEX = 'documentation'
    }

    query (index, body) {
        return new Promise((resolve, reject) => {
            this.elasticClient.search({
                index: index,
                type: '_doc',
                body: body
            }, (err, response) => {
                if (err) {
                    reject(err.message)
                } else {
                    resolve(response.hits.hits)
                }
            })
        })
    }

    scrollQuery (index, body, callback) {
        const self = this
        return new Promise((resolve, reject) => {
            self.elasticClient.search({
                index: index,
                type: '_doc',
                scroll: '1m',
                body: body

            }, function getMoreUntilDone(error, response) {
                co (function* () {
                    let count = 0
                    for (let i = 0; i < response.hits.hits.length; i++) {
                        yield callback(response.hits.hits[i])
                        count ++
                    }

                    if (response.hits.total > count) {
                        self.scroll({
                            scrollId: response._scroll_id,
                            scroll: '1m'
                        }, getMoreUntilDone)
                    } else {
                        resolve(true)
                    }
                })

            })
        })
    }

    insert (index, id, body) {
        return new Promise((resolve, reject) => {
            this.elasticClient.index({
                index: index,
                type: '_doc',
                id: id,
                body: body,
            }, (err, response) => {
                if (err) {
                    reject(err.message)
                } else {
                    console.log(response)
                    resolve(true)
                }
            })
        })
    }

    delete(index, id) {
        return new Promise((resolve, reject) => {
            this.elasticClient.delete({
                index: index,
                type: '_doc',
                id: id
            }, (err, response) => {
                if (err) {
                    reject(err.message)
                } else {
                    console(response)
                    resolve(true)
                }
            })
        })
    }

    update(index, body) {
        return new Promise((resolve, reject) => {
            this.elasticClient.updateByQuery({
                index: index,
                type: '_doc',
                body: body
            }, (err, response) => {
                if (err) {
                    reject(err.message)
                } else {
                    console.log(response)
                    resolve(true)
                }
            })
        })
    }
}

module.exports =  ElasticsearchGeoTag
