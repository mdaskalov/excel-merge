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
  const viewIndex = views.map(view => view.name).indexOf(viewName)
  if (viewIndex != -1) {
    var template = fs.readFileSync(path.join(__dirname, 'templates', viewName + '.mustache'), 'utf-8')
    const dataPane = document.querySelector('#data-pane')
    dataPane.innerHTML = mustache.render(template, views[viewIndex]);
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

document.querySelector('#select-input-file').addEventListener('click', () => {
  ipcRenderer.send('select-input-file')
})

// Messages

ipcRenderer.on('input-file-selected', (_, fileName) => {
  input.parseFile(fileName).then(() => {
    renderDataPane('input')
  })
})

// Global

renderDataPane('input')
