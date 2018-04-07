const elasticsearch = require('elasticsearch')
const uuid = require('node-uuid')

const config = require('../config')

const GEOTAG_INDEX = 'GeotagIndex'
const GEOTAG_TYPE = 'GeotagType'

class ElasticsearchGeoTag{

    constructor () {
        this.elasticClient = new elasticsearch.Client({
            host: config.elasticsearch.host,
            log: config.elasticsearch.log
        })
    }

    query (body) {
        return new Promise((resolve, reject) => {
            this.elasticClient.search({
                index: GEOTAG_INDEX,
                type: GEOTAG_TYPE,
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

    insert (body) {
        return new Promise((resolve, reject) => {
            this.elasticClient.index({
                index: GEOTAG_INDEX,
                type: GEOTAG_TYPE,
                id: uuid.v4(),
                body: body
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

    delete(id) {
        return new Promise((resolve, reject) => {
            this.elasticClient.delete({
                index: GEOTAG_INDEX,
                type: GEOTAG_TYPE,
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
