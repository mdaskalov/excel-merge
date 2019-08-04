// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const {
  ipcRenderer
} = require('electron')
const mustache = require('mustache')
const fs = require('fs')
const path = require('path')
const input = require('./src/input')
const mapping = require('./src/mapping')
const output = require('./src/output')

const views = [input, mapping, output];

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
      activateDocLink(viewName)
      renderDataPane(viewName)
    })
  }
})

for (const doc of ['input', 'mapping', 'output']) {
  document.querySelector(`#select-${doc}-file`).addEventListener('click', () => {
    document.querySelector(`#select-${doc}-file`).classList.add('active')
    ipcRenderer.send(`select-${doc}-file`)
  })
}

// Messages

ipcRenderer.on('input-file-selected', (_, fileName) => {
  document.querySelector('#select-input-file').classList.remove('active')
  if (fileName) {
    input.parseFile(fileName).then(() => {
      deactivateDocLinks()
      activateDocLink('input')
      renderDataPane('input')
    })
  }
})

ipcRenderer.on('mapping-file-selected', (_, fileName) => {
  document.querySelector('#select-mapping-file').classList.remove('active')
  if (fileName) {
    mapping.parseFile(fileName).then(() => {
      deactivateDocLinks()
      activateDocLink('mapping')
      renderDataPane('mapping')
    })
  }
})

ipcRenderer.on('output-file-selected', (_, fileName) => {
  document.querySelector('#select-output-file').classList.remove('active')
  if (fileName) {
    output.saveFile(fileName, input.data, mapping.data).then(() => {
      deactivateDocLinks()
      activateDocLink('output')
      renderDataPane('output')
    })
  }
})

// Global

renderDataPane('input')