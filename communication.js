const {
  ipcMain,
  dialog
} = require('electron')
const path = require('path')

ipcMain.on('select-input-file', event => {
  dialog.showOpenDialog({
    properties: ['openFile']
  }, files => {
    if (files) {
      if (files.length >= 1) {
        var relativePath = path.relative(process.cwd(), files[0]);
        event.sender.send('input-file-selected', relativePath)
      }
    }
  })
})
