const elasticsearch = require('elasticsearch')
const uuid = require('node-uuid')

const config = require('../config')

const GEOTAG_INDEX = 'GeotagIndex'
const GEOTAG_TYPE = 'GeotagType'

class Elasticsearch{

    constructor () {
        this.elasticClient = new elasticsearch.Client({
            host: config.elasticsearch.host,
            log: config.elasticsearch.log
        })
    }

    query () {
    }

    insert () {
        return new Promise((resolve, reject) => {
            this.elasticClient.index({
                index: GEOTAG_INDEX,
                type: GEOTAG_TYPE,
                id: uuid.v4(),
                body: {
                }
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

    delete() {
    }

    update () {
    }
}

module.exports =  Elasticsearch
