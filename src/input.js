var Excel = require('exceljs');
var _ = require('lodash');

const name = 'input'
var data = []

const parseFile = filename =>
  new Promise(resolve => {
    var workbook = new Excel.Workbook();
    workbook.xlsx.readFile(filename)
      .then(() => {
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
        resolve()
      })
  })

const renderHTML = () => {
  if (Array.isArray(data) && data.length !== 0) {
    var html = '<table class="table-striped"><thead><tr><th>Name</th><th>m2</th></tr></thead><tbody>'
    data.forEach(dat => {
      html += `<tr><th class="group-header" colspan="2">${dat.stairway} / ${dat.floor} / Top: ${dat.apt}, Einheit: ${dat.unit}</th></tr>`
      dat.content.forEach(cnt => {
        html += `<tr><td>${cnt.room}</td><td>${cnt.surface}</td></tr>`
      })
    })
    html += '</tbody></table>'
    return html
  } else {
    return 'no data.'
  }
}

exports.name = name;
exports.data = data;
exports.parseFile = parseFile;
exports.renderHTML = renderHTML;
