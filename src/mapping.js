name = 'mapping'
data = []

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
exports.renderHTML = renderHTML;
