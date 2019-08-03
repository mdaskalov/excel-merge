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

ipcMain.on('select-input-file', event => {
  selectExcelFile().then(path =>
    event.sender.send('input-file-selected', path))
})