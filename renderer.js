// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const {
  ipcRenderer
} = require('electron')

document.querySelector('#open-source-file').addEventListener('click', () => {
  ipcRenderer.send('open-file-dialog')
})

ipcRenderer.on('parsed-data', (event, data) => {
  const tbody = document.querySelector("#table-body")
  var html = ""
  data.forEach(dat => {
    html += `<tr><th class="group-header" colspan="2">${dat.stairway} / ${dat.floor} / Top: ${dat.apt}, Einheit: ${dat.unit}</th></tr>`
    dat.content.forEach(cnt => {
      html += `<tr><td>${cnt.room}</td><td>${cnt.surface}</td></tr>`
    })
  })
  tbody.innerHTML = html;
})
