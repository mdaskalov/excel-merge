// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const {
  dialog
} = require('electron').remote

const mustache = require('mustache')
const fs = require('fs')
const path = require('path')
const input = require('./src/input')
const mapping = require('./src/mapping')
const output = require('./src/output')

const views = [input, mapping, output];

selectExcelFile = done => {
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
      done(relativePath)
    })
}

saveExcelFile = done => {
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
      done(relativePath)
    })
}

const deactivateDocLinks = () => {
  const active = document.querySelectorAll('.nav-group-item.active')
  Array.prototype.forEach.call(active, item => {
    item.classList.remove('active')
  })
}

const activateDocLink = view => {
  const docLink = document.querySelector(`#${view}-view.nav-group-item`)
  docLink.classList.add('active')
}

const renderDataPane = viewName => {
  const view = views.find(v => v.name == viewName)
  if (view) {
    var template = fs.readFileSync(path.join(__dirname, 'templates', viewName + '.mustache'), 'utf-8')
    const dataPane = document.querySelector('#data-pane')
    dataPane.innerHTML = mustache.render(template, view);
  }
}

// Events

const docButtons = document.querySelectorAll('.nav-group-item')
Array.prototype.forEach.call(docButtons, button => {
  const viewName = button.id.substring(0, button.id.indexOf("-view"))
  if (viewName != undefined) {
    button.addEventListener('click', () => {
      deactivateDocLinks()
      renderDataPane(viewName)
      activateDocLink(viewName)
    })
  }
})

document.querySelector(`#select-input-file`).addEventListener('click', () => {
  document.querySelector(`#select-input-file`).classList.add('active')
  selectExcelFile(fileName => {
    document.querySelector('#select-input-file').classList.remove('active')
    if (fileName) {
      input.parseFile(fileName, () => {
        deactivateDocLinks()
        activateDocLink('input')
        renderDataPane('input')
      })
    }
  })
})

document.querySelector(`#select-mapping-file`).addEventListener('click', () => {
  document.querySelector(`#select-mapping-file`).classList.add('active')
  selectExcelFile(fileName => {
    document.querySelector('#select-mapping-file').classList.remove('active')
    if (fileName) {
      mapping.parseFile(fileName, () => {
        deactivateDocLinks()
        activateDocLink('mapping')
        renderDataPane('mapping')
      })
    }
  })
})

document.querySelector(`#select-output-file`).addEventListener('click', () => {
  document.querySelector(`#select-output-file`).classList.add('active')
  saveExcelFile(fileName => {
    document.querySelector('#select-output-file').classList.remove('active')
    if (fileName) {
      output.saveFile(fileName, input.data, mapping.data, () => {
        deactivateDocLinks()
        activateDocLink('output')
        renderDataPane('output')
      })
    }
  })
})

// Global

renderDataPane('input')