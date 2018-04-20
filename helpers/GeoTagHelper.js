const ElasticsearchGeoTag  = require('../modules/elasticsearchGeoTag')

class GeoTagHelper {

    constructor () {
        this.elasticsearchGeoTag = new ElasticsearchGeoTag()
    }


}

module.exports = GeoTagHelper