var Excel = require('exceljs')
var _ = require('lodash')

const name = 'mapping'
var data = []

const parseFile = filename =>
  new Promise(resolve => {
    data.length = 0
    var workbook = new Excel.Workbook()
    workbook.xlsx.readFile(filename)
      .then(() => {
        var worksheet = workbook.getWorksheet(1)
        worksheet.eachRow({
          includeEmpty: false
        }, (row, rowNumber) => {
          let room = row.getCell(1).value
          let instance = row.getCell(2).value
          let column = row.getCell(3).value
          let description = row.getCell(4).value
          if (rowNumber > 1 && (room != '') && (column != '')) {
            //console.log(`${room} - ${instance} -> ${column}`)
            data.push({
              room,
              instance,
              column,
              description
            })
          }
        })
        resolve()
      })
  })

exports.name = name
exports.data = data
exports.parseFile = parseFile