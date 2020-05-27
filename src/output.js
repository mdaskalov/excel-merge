const {
  dialog
} = require('electron').remote
const Excel = require('exceljs')
const _ = require('lodash');

const CHECK = 'x'
const UNIT_FOR_D_TYPE = 'Balance'

const name = 'output'
var data = []

convertUnit = (row, unit) => {
  if (unit != '') {
    const cell = unit == UNIT_FOR_D_TYPE ? 'D' : unit.charAt(0)
    const smart = unit.charAt(1)
    if (cell >= 'A' && cell <= 'E') {
      row.getCell(cell).value = CHECK
    }
    row.getCell(smart === 's' ? 'G' : 'F').value = CHECK
  }
}

createHeaderRow = (row, mapping) => {
  for (const cell of ['A', 'B', 'C', 'D', 'E']) {
    row.getCell(cell).value = cell
  }
  row.getCell('F').value = 'Kein SMART'
  row.getCell('G').value = 'SMART'
  row.getCell('H').value = 'Stiege'
  row.getCell('I').value = 'Topnummer'
  row.getCell('J').value = 'Bauträger'
  row.getCell('K').value = 'Art'
  mapping.forEach(entry => {
    row.getCell(entry.column).value = entry.description
    row.getCell(entry.column).alignment = {
      textRotation: 90
    };
  })
  row.eachCell(c => {
    c.font = {
      bold: true
    }
  })

}

saveFile = (name, input, mapping, done) => {
  data.length = 0
  if (name != '' && Array.isArray(input) && Array.isArray(mapping)) {
    if (input.length == 0 || mapping.length == 0) {
      dialog.showErrorBox('No Files Selected', 'Load the Input and Mapping documents first.')
      return
    }
    var workbook = new Excel.Workbook();
    var worksheet = workbook.addWorksheet('Output');
    const header = worksheet.getRow(1)
    createHeaderRow(header, mapping)
    input.forEach((item, index) => {
      const row = worksheet.getRow(index + 2)
      row.getCell('H').value = parseInt(item.stairway, 10)
      row.getCell('I').value = parseInt(item.apt, 10)
      item.content.forEach(cnt => {
        convertUnit(row, cnt.unit)
        var mapped = _.filter(mapping, {
          'roomName': cnt.roomName,
          'instance': cnt.instance,
        })
        if (mapped.length === 1) {
          const column = mapped[0].column
          row.getCell(column).value = parseFloat(cnt.surface)
          row.getCell(column).numFmt = '0.00';
        } else {
          data.push({
            item,
            roomName: cnt.roomName,
            instance: cnt.instance
          })
        }
      })
      row.commit()
    })
    workbook.xlsx.writeFile(name)
      .then(() => {
        done()
      })
  }
}

exports.name = name
exports.data = data
exports.saveFile = saveFile