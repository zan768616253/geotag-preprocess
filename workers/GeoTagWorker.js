const { readFileSync } = require('fs')
const co = require('co')
const md5 = require('md5')

const FileHelper = require('../helpers/FileHelper')
const ElasticsearchHelper = require('../helpers/ElasticsearchHelper')
const config = require('../config')

const fileHelper = new FileHelper()
const elasticsearchHelper = new ElasticsearchHelper()

class GeoTagWorker {

    constructor () {

    }

    SynchronizeDBForData (folder) {
        return new Promise((resolve, reject) => {
            const structure = fileHelper.getFolderStructure(folder || config.DEFAULT_DATA_FOLDER)
            const dirIdList = structure.folderIds
            const dirItems = structure.folderItems

            co (function* () {
                // for (let i = 0; i < dirIdList.length; i++) {
                for (let dirId of dirIdList) {
                    const dir = dirItems[dirId]
                    const files = fileHelper.getFiles(dir)
                    if (files && files.length) {
                        for (let file of files) {
                            const content = readFileSync(file,'utf-8')
                            const body = {
                                path: file,
                                content: content
                            }

                            const result = yield elasticsearchHelper.insertDataToDOC(md5(file), body)
                            console.log(result)
                        }

                    }
                }
                resolve(true)
            }).catch(err => {
            })
        })
    }

    SynchronizeDBForTag (folder) {
        return new Promise((resolve, reject) => {
            elasticsearchHelper.updateGeotags().then(r => {
                resolve(r)
            })
        })

    }
}

module.exports = GeoTagWorker