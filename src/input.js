const Excel = require('exceljs')
const _ = require('lodash')

const name = 'input'
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
          let stairway = row.getCell(1).value
          let floor = row.getCell(2).value
          let apt = row.getCell(3).value
          let unit = row.getCell(4).value
          let room = row.getCell(5).value
          let surface = row.getCell(6).value
          //console.log(`${stairway} / ${floor} / Top: ${apt} -> ${unit}, ${room} - ${surface} m2`)
          if (rowNumber > 2 && (stairway != '') && (floor != '') && (apt != '') && (unit != '')) {
            var existing = _.filter(data, {
              'stairway': stairway,
              'floor': floor,
              'apt': apt,
              'unit': unit
            })
            if (existing.length !== 0) {
              let content = existing[0].content
              if (Array.isArray(content)) {
                var instance = _.filter(content, {
                  room
                }).length + 1
                content.push({
                  room,
                  instance,
                  surface
                })
              }
            } else {
              data.push({
                stairway,
                floor,
                apt,
                unit,
                content: [{
                  room,
                  instance: 1,
                  surface
                }]
              })
            }
          }
        })
        resolve()
      })
  })

exports.name = name
exports.data = data
exports.parseFile = parseFile