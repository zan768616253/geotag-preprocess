const FileHelper = require('./helpers/FileHelper')

const fileHelper = new FileHelper()

const structure = fileHelper.getFolderStructure('data')
const isToDB = fileHelper.iterateFolderToUpdateDB(structure)
