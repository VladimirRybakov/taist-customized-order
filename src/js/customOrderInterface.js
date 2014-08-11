module.exports = {
  create: function(container){
    var div,
        table  = $('<table>')
          .addClass('taist-table'),
        thead  = $('<thead>').appendTo(table),
        trhead = $('<tr>').appendTo(thead),
        tbody  = $('<tbody data-bind="foreach: selectedOrder().customerOrderPosition()">').appendTo(table),
        trbody = $('<tr>').appendTo(tbody);

    div = $('<div>')
      .attr('data-bind', 'if: basePlan() !== null')
      .appendTo(container);
    $('<span>')
      .text('Базовая технологическая карта')
      .appendTo(div);
    $('<span>')
      .addClass('ml20 bold')
      .attr('data-bind', 'text: basePlan().name')
      .appendTo(div);

    div = $('<div>')
      .appendTo(container);
    $('<span>')
      .text('Название заказа')
      .appendTo(div);
    $('<span>')
      .addClass('ml20 bold')
      .attr('data-bind', 'text: selectedOrder().name')
      .appendTo(div);

    div = $('<div>').appendTo(container);
    $('<span>')
      .text('Количество подарков')
      .appendTo(div);
    $('<input>')
      .addClass('tar')
      .attr('data-bind', 'value: selectedOrder()._presentsCount')
      .css({ width: 40, marginLeft: 20})
      .appendTo(div);

    div = $('<div>').appendTo(container);
    $('<span>')
      .text('Итого:')
      .appendTo(div);
    $('<span>')
      .addClass('ml20 bold fs125')
      .attr('data-bind', 'text: selectedOrder()._sTotal')
      .appendTo(div);

    div = $('<div>').appendTo(container);
    $('<span>')
      .text('НДС:')
      .appendTo(div);
    $('<span>')
      .addClass('ml20')
      .attr('data-bind', 'text: selectedOrder()._sVat')
      .appendTo(div);

    [
      { title: 'Товар', bind: 'text', var: '_name' },
      { title: 'Тех. карта', bind: 'value', var: '_quantityPerPresent', cls: 'tar' },
      { title: 'Кол-во', bind: 'text', var: '_quantity', cls: 'tar' },
      { title: 'Резерв', bind: 'text', var: 'reserve', cls: 'tar' },
      { title: 'Цена', bind: 'text', var: '_price', cls: 'tar' },
      // { title: 'Скидка, %', bind: 'text', var: 'discount', cls: 'tar' },
      { title: 'НДС, %', bind: 'text', var: 'vat', cls: 'tar' },
      { title: 'Сумма НДС', bind: 'text', var: '_sVat', cls: 'tar' },
      { title: 'Итого', bind: 'text', var: '_sTotal', cls: 'tar' },
      { title: '', bind: 'text', var: "'x'", cls: 'removePosition', click: '_onRemove'},
    ].map(function(item){
      $('<td>').text(item.title).appendTo(trhead);
      var td = $('<td>')
        .addClass(item.cls || '')
        .addClass(item.var)
        .appendTo(trbody),
          bindValue = item.bind + ":" + item.var;

      if(item.click) {
        bindValue += ', click: ' + item.click;
      }

      $(item.bind == 'value' ? '<input>' : '<span>')
        .attr("data-bind", bindValue)
        .appendTo(td);
    })

    table.appendTo(container);
  }
}
