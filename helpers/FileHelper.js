const { lstatSync, readdirSync } = require('fs')
const { join } = require('path')
const uuid = require('node-uuid')

const getSubFolder = function (root) {
    const isDirectory = source => lstatSync(source).isDirectory()
    const subFolders = source => readdirSync(source).map(name => join(source, name)).filter(isDirectory)
    return subFolders()
}

class FileHelper {

    constructor (root) {
        this.root = root
    }

    getFolderStructure (root) {
        const root_directory = root || this.root
        const dirIdList = []
        const dirItems = {}


    }

    iterateFolderToUpdateDB (folder) {

    }



}

module.exports = FileHelper