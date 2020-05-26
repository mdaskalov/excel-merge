const Excel = require('exceljs')
const _ = require('lodash')

const name = 'input'
var data = []

const TYPE_A_ROOMS = 1
const TYPE_A_SMART_TH = 40.0
const TYPE_B_ROOMS = 2
const TYPE_B_SMART_TH = 55.0
const TYPE_C_ROOMS = 3
const TYPE_C_SMART_TH = 70.0
const TYPE_D_ROOMS = 4
const TYPE_D_SMART_TH = 85.0

const ROOM_NAMES = ['Zimmer', 'Wohnzimmer', 'Wohnküche', 'Wohnraum']
const NO_ROOM_SURFACE_NAMES = ['Balkon', 'Terrasse', 'Loggia', 'Garten', 'KA']

isRoomName = name => {
  return ROOM_NAMES.indexOf(name) > -1
}

isRoomSurface = name => {
  return NO_ROOM_SURFACE_NAMES.indexOf(name) == -1
}

aptType = (rooms, surface) => {
  switch (rooms) {
    case 0:
      return '-'
    case TYPE_A_ROOMS:
      return surface <= TYPE_A_SMART_TH ? 'As' : 'A'
    case TYPE_B_ROOMS:
      return surface <= TYPE_B_SMART_TH ? 'Bs' : 'B'
    case TYPE_C_ROOMS:
      return surface <= TYPE_C_SMART_TH ? 'Cs' : 'C'
    case TYPE_D_ROOMS:
      return surface <= TYPE_D_SMART_TH ? 'Ds' : 'D'
    default:
      return 'E'
  }
}

roundNumber = num => {
  return +(Math.round(num + "e+2") + "e-2");
}

convertStairway = src => {
  var n = src.lastIndexOf(' ');
  if (n != -1) {
    return parseInt(src.substring(n + 1), 10)
  }
}

const parseFile = (filename, done) => {
  data.length = 0
  var workbook = new Excel.Workbook()
  workbook.xlsx.readFile(filename)
    .then(() => {
      var worksheet = workbook.getWorksheet(1)
      worksheet.eachRow({
        includeEmpty: false
      }, (row, rowNumber) => {
        let stairway = convertStairway(row.getCell(1).text.trim())
        let apt = parseInt(row.getCell(3).text.trim(), 10)
        let floor = row.getCell(2).text.trim()
        let unit = row.getCell(4).text.trim()
        let roomName = row.getCell(5).text.trim()
        let surface = roundNumber(row.getCell(6).value)
        let isRoom = isRoomName(roomName)
        let roomSurface = isRoomSurface(roomName) ? surface : 0
        //console.log(`Row: ${rowNumber}: ${stairway} / ${floor} / ${apt} -> Unit: ${unit}, RoomName: ${roomName} - Surface: ${surface} m2, RoomSurface: ${roomSurface} m2`)
        if (rowNumber > 2 && !isNaN(stairway) && !isNaN(apt)) {
          var existing = _.filter(data, {
            'stairway': stairway,
            'apt': apt
          })
          if (existing.length !== 0) {
            let summary = existing[0].summary
            if (floor != '') {
              summary.floor = _.union(summary.floor, [floor])
            }
            if (unit != '') {
              summary.unit = _.union(summary.unit, [unit])
            }
            summary.surface = roundNumber(summary.surface + surface)
            if (isRoom) {
              summary.rooms += 1
            }
            summary.roomsSurface = roundNumber(summary.roomsSurface + roomSurface)
            summary.type = aptType(summary.rooms, summary.roomsSurface)
            let content = existing[0].content
            if (Array.isArray(content)) {
              var instance = _.filter(content, {
                roomName
              }).length + 1
              content.push({
                roomName,
                instance,
                floor,
                unit,
                isRoom,
                surface: surface
              })
            }
          } else {
            let rooms = isRoomName(roomName) ? 1 : 0
            let roomsSurface = roundNumber(roomSurface)
            let type = aptType(rooms, roomsSurface)
            data.push({
              stairway,
              apt,
              summary: {
                floor: floor != '' ? [floor] : [],
                unit: unit != '' ? [unit] : [],
                surface,
                rooms,
                roomsSurface: roomSurface,
                type
              },
              content: [{
                roomName,
                instance: 1,
                floor,
                unit,
                isRoom,
                surface: surface
              }]
            })
          }
        }
      })
      done()
    })
}

exports.name = name
exports.data = data
exports.parseFile = parseFile