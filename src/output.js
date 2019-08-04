const {
  dialog
} = require('electron').remote
const Excel = require('exceljs')
const _ = require('lodash');

const CHECK = 'x'

const name = 'output'
var data = []

convertStairway = src => {
  var n = src.lastIndexOf(' ');
  if (n != -1) {
    return parseInt(src.substring(n + 1), 10)
  }
}

convertUnit = (row, unit) => {
  const cell = unit.charAt(0)
  const smart = unit.charAt(1)
  if (cell >= 'A' && cell <= 'E') {
    row.getCell(cell).value = CHECK
  }
  row.getCell(smart === 's' ? 'G' : 'F').value = CHECK
}

saveFile = (name, input, mapping) =>
  new Promise(resolve => {
    data.length = 0
    if (name != '' && Array.isArray(input) && Array.isArray(mapping)) {
      if (input.length == 0 || mapping.length == 0) {
        dialog.showErrorBox('No Files Selected', 'Load the Input and Mapping documents first.')
        return
      }
      var workbook = new Excel.Workbook();
      var worksheet = workbook.addWorksheet('Output');

      input.forEach((item, index) => {
        const row = worksheet.getRow(index)
        row.getCell('H').value = convertStairway(item.stairway)
        row.getCell('I').value = parseInt(item.apt, 10)
        convertUnit(row, item.unit)
        item.content.forEach(cnt => {
          var mapped = _.filter(mapping, {
            'room': cnt.room.trim(),
            'instance': cnt.instance,
          })
          if (mapped.length === 1) {
            const column = mapped[0].column
            row.getCell(column).value = cnt.surface
          } else {
            data.push({
              item,
              room: cnt.room,
              instance: cnt.instance
            })
          }
        })
        row.commit()
      })
      workbook.xlsx.writeFile(name)
        .then(() => {
          resolve()
        })
    }
  })

exports.name = name
exports.data = data
exports.saveFile = saveFile