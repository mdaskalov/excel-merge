const {
  ipcMain,
  dialog
} = require('electron')
const path = require('path')

selectExcelFile = () =>
  new Promise(resolve => {
    dialog.showOpenDialog({
        filters: [{
          name: 'Excel Files',
          extensions: ['xls', 'xlsx']
        }],
        properties: ['openFile']

      })
      .then(result => {
        var relativePath
        if (!result.canceled && result.filePaths.length >= 1) {
          relativePath = path.relative(process.cwd(), result.filePaths[0]);
        }
        resolve(relativePath)
      })
  })

saveExcelFile = () =>
  new Promise(resolve => {
    dialog.showSaveDialog({
        filters: [{
          name: 'Excel Files',
          extensions: ['xls', 'xlsx']
        }],
        defaultPath: 'output.xlsx'

      })
      .then(result => {
        var relativePath
        if (!result.canceled && result.filePath) {
          relativePath = path.relative(process.cwd(), result.filePath);
        }
        resolve(relativePath)
      })
  })

ipcMain.on('select-input-file', event => {
  selectExcelFile().then(path =>
    event.sender.send('input-file-selected', path))
})

ipcMain.on('select-mapping-file', event => {
  selectExcelFile().then(path =>
    event.sender.send('mapping-file-selected', path))
})

ipcMain.on('select-output-file', event => {
  saveExcelFile().then(path =>
    event.sender.send('output-file-selected', path))
})