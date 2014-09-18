module.exports = function(table, fields, collectionName) {
  var thead  = $('<thead>').appendTo(table),
      trhead = $('<tr>').appendTo(thead),
      tbody  = $('<tbody data-bind="foreach: ' + collectionName + '">').appendTo(table),
      trbody = $('<tr>').appendTo(tbody);

  fields.map(function(item){
    $('<td>').text(item.title).appendTo(trhead);
    var elem,
        td = $('<td>')
          .addClass(item.cls || '')
          .addClass(item.var)
          .appendTo(trbody),
        bindValue = item.bind + ":" + item.var;

    if(item.click) {
      bindValue += ', click: ' + item.click;
    }

    elem = $(item.bind == 'text' ? '<span>' : '<input>')
      .attr("data-bind", bindValue)
      .appendTo(td);

    if(item.bind == 'checked') {
      elem.attr('type', 'checkbox');
    }

    if(typeof item.custom === 'function') {
      item.custom(elem);
    }
  });
}
