var Excel = require('exceljs')

const name = 'mapping'
var data = []

const parseFile = (filename, done) => {
  data.length = 0
  var workbook = new Excel.Workbook()
  workbook.xlsx.readFile(filename)
    .then(() => {
      var worksheet = workbook.getWorksheet(1)
      worksheet.eachRow({
        includeEmpty: false
      }, (row, rowNumber) => {
        let roomName = row.getCell(1).text.trim()
        let instance = parseInt(row.getCell(2).value)
        let column = row.getCell(3).text.trim()
        let description = row.getCell(4).text
        if (rowNumber > 1 && (roomName != '') && !isNaN(instance) && (column != '')) {
          //console.log(`${roomName} - ${instance} -> ${column}`)
          data.push({
            roomName,
            instance,
            column,
            description
          })
        }
      })
      done()
    })
}

exports.name = name
exports.data = data
exports.parseFile = parseFile