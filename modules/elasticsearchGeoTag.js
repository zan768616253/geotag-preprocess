const elasticsearch = require('elasticsearch')
const uuid = require('node-uuid')

const config = require('../config')

const GEOTAG_INDEX = 'geotagindex'

class ElasticsearchGeoTag{

    constructor () {
        this.elasticClient = new elasticsearch.Client({
            host: config.elasticsearch.host,
            log: config.elasticsearch.log
        })
        this.GEOTAG_TYPE = 'geotagtype'
        this.DOC_TYPE = 'doc'
    }

    query (type, body) {
        return new Promise((resolve, reject) => {
            this.elasticClient.search({
                index: GEOTAG_INDEX,
                type: type,
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

    insert (type, body) {
        return new Promise((resolve, reject) => {
            this.elasticClient.index({
                index: GEOTAG_INDEX,
                type: type,
                id: uuid.v4(),
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

    delete(type, id) {
        return new Promise((resolve, reject) => {
            this.elasticClient.delete({
                index: GEOTAG_INDEX,
                type: type,
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

    update () {
    }
}

module.exports =  ElasticsearchGeoTag
