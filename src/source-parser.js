var Excel = require('exceljs');
var _ = require('lodash');

const parseSourceFile = (filename, callback) => {
  var workbook = new Excel.Workbook();
  workbook.xlsx.readFile(filename)
    .then(() => {
      var data = []

      var worksheet = workbook.getWorksheet(1);
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
            if (Array.isArray(existing[0].content)) {
              existing[0].content.push({
                room,
                surface
              })
            } else {
              console.log('content not found')
            }
          } else {
            data.push({
              stairway,
              floor,
              apt,
              unit,
              content: [{
                room,
                surface
              }]
            })

          }

        }
      })
      callback(data)
    })
}

exports.parseSourceFile = parseSourceFile;
