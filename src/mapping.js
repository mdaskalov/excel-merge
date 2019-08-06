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
        let room = row.getCell(1).text.trim()
        let instance = parseInt(row.getCell(2).value)
        let column = row.getCell(3).text.trim()
        let description = row.getCell(4).text
        if (rowNumber > 1 && (room != '') && !isNaN(instance) && (column != '')) {
          //console.log(`${room} - ${instance} -> ${column}`)
          data.push({
            room,
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