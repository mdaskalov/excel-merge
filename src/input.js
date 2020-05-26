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

const isRoomName = name => {
  return ROOM_NAMES.indexOf(name) > -1
}

const isRoomSurface = name => {
  return NO_ROOM_SURFACE_NAMES.indexOf(name) == -1
}

const aptType = (rooms, surface) => {
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

const roundNumber = num => {
  return +(Math.round(num + "e+2") + "e-2");
}

const convertStairway = src => {
  var n = src.lastIndexOf(' ');
  if (n != -1) {
    return parseInt(src.substring(n + 1), 10)
  }
}

const pad = (num, size) => {
  var s = num + "";
  while (s.length < size) s = "0" + s;
  return s;
}

const formatApartment = (stairway, apt) => {
  iStairway = convertStairway(stairway)
  iApt = parseInt(apt, 10)
  return isNaN(iStairway) || isNaN(iApt) ? '' : pad(iStairway, 2) + '/' + pad(iApt, 2)
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
        let apt = formatApartment(row.getCell(1).text.trim(), row.getCell(3).text.trim())
        let floor = row.getCell(2).text.trim()
        let unit = row.getCell(4).text.trim()
        let roomName = row.getCell(5).text.trim()
        let surface = roundNumber(row.getCell(6).value)
        let isRoom = isRoomName(roomName)
        let roomSurface = isRoomSurface(roomName) ? surface : 0
        //console.log(`Row: ${rowNumber}: ${stairway} / ${floor} / ${apt} -> Unit: ${unit}, RoomName: ${roomName} - Surface: ${surface} m2, RoomSurface: ${roomSurface} m2`)
        if ((rowNumber > 2) && (apt != '')) {
          var existing = _.filter(data, {
            'apt': apt
          })
          if (existing.length !== 0) {
            let summary = existing[0].summary
            summary.floor = _.union(summary.floor, floor != '' ? [floor] : [])
            summary.unit = _.union(summary.unit, unit != '' ? [unit] : [])
            summary.surface = roundNumber(summary.surface + surface)
            summary.rooms += isRoom ? 1 : 0
            summary.roomsSurface = roundNumber(roundNumber(summary.roomsSurface) + roomSurface).toFixed(2)
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
                surface: surface.toFixed(2)
              })
            }
          } else {
            let rooms = isRoomName(roomName) ? 1 : 0
            let roomsSurface = roundNumber(roomSurface)
            let type = aptType(rooms, roomsSurface)
            data.push({
              apt,
              summary: {
                floor: floor != '' ? [floor] : [],
                unit: unit != '' ? [unit] : [],
                surface,
                rooms,
                roomsSurface: roomSurface.toFixed(2),
                type
              },
              content: [{
                roomName,
                instance: 1,
                floor,
                unit,
                isRoom,
                surface: surface.toFixed(2)
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