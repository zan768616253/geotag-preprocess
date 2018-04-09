

const { lstatSync, readdirSync, readFileSync } = require('fs')
const { join } = require('path')
const uuid = require('node-uuid')
const TARGETPATTERN = /\.txt$/ig

const iterateGetAllSubFolder = function (roots, dirIdList, dirItems){
    roots.forEach(root => {
        const id = uuid.v4()
        dirIdList.push(id)
        dirItems[id] = root
        const folders = getSubFolder(root)
        if (folders || folders.length) {
            iterateGetAllSubFolder(folders, dirIdList, dirItems)
        }
    })
}

const getSubFolder = function (root) {
    const isDirectory = source => lstatSync(source).isDirectory()
    const subFolders = source => readdirSync(source).map(name => join(source, name)).filter(isDirectory)
    return subFolders(root)
}

const getFiles = function (root) {
    const isFIle = source => source.search(TARGETPATTERN) !== -1
    const files = source => readdirSync(source).map(name => join(source, name)).filter(isFIle)
    return files(root)
}

class FileHelper {

    constructor (root) {
        this.root = root
    }

    getFolderStructure (root) {
        const root_directory = root || this.root
        const dirIdList = []
        const dirItems = {}
        iterateGetAllSubFolder([root_directory], dirIdList, dirItems)
        return {
            folderIds: dirIdList,
            folderItems: dirItems
        }
    }

    iterateFolderToUpdateDB (folderStructure) {
        const dirIdList = folderStructure.folderIds
        const dirItems = folderStructure.folderItems

        for (let i = 0; i < dirIdList.length; i++) {
            const dir = dirItems[dirIdList[i]]
            const files = getFiles(dir)
            if (files && files.length) {
                files.forEach(file => {
                    const content = readFileSync(file,'utf-8')
                    const body = {
                        path: file,
                        content: content
                    }

                })
            }
        }
    }

}

module.exports = FileHelper