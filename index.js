const co = require('co')

const GeoTagWorker = require('./workers/GeoTagWorker')

const geoTagWorker = new GeoTagWorker()

co(function* () {
    yield geoTagWorker.SynchronizeDBForTag()
    yield geoTagWorker.SynchronizeDBForData()
    yield geoTagWorker.ExtractGeotags()
})

