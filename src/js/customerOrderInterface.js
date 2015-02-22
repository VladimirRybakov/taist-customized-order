module.exports = {
  create: function(container){
    var div,
        table  = $('<table>').addClass('taist-table');

    orderFields = [
      {
        divBind: 'if: basePlan() !== null',
        name: 'Базовая технологическая карта',
        cls: 'ml20 bold',
        bind: 'text: basePlan().name',
      },

      { name: 'Название заказа', cls: 'ml20 bold', bind: 'text: selectedOrder()._name' },

      {
        name: '&nbsp;', cls: '', elem: 'input',
        bind: 'value: selectedOrder()._customName',
        css: { width: 300, marginLeft: 20}
      },

      {
        name: 'Количество подарков', cls: 'tar', elem: 'input',
        bind: 'value: selectedOrder()._presentsCount',
        css: { width: 60, marginLeft: 20}
      },

      { name: 'Итого:', cls: 'ml20 bold fs125', bind: 'text: selectedOrder()._sTotal' },
      { name: 'НДС:', cls: 'ml20', bind: 'text: selectedOrder()._sVat' },

      { name: 'Итого (+ упаковка и риски):', cls: 'ml20', bind: 'text: selectedOrder()._sTotalWithPackageAndRisks' },

      { name: '', cls: '', bind: '' },
    ]

    orderFields.map(function(field){
      var div = $('<div>');

      if(field.divBind) {
        div.attr('data-bind', field.divBind);
      }

      $('<span>').addClass('w200').html(field.name).appendTo(div)

      var elem = field.elem || 'span';
      var node = $('<' + elem + '>')
        .addClass(field.cls)
        .attr('data-bind', field.bind)
        .appendTo(div)

      if(field.css){
        node.css(field.css);
      }

      div.appendTo(container)
    });

    function modifyFieldAvailability(elem) {
      var div,
          container = elem.parent();

      container.css({position: 'relative'});

      hide = function() {
        $('.availabilityInfo').hide();
        return false;
      }

      show = function(data, event) {
        $('.availabilityInfo').hide();
        $('.availabilityInfo', $(event.target).parent()).show();
      }

      container.attr('data-bind', 'css: _availabilityColor');

      div = $('<div>')
        .addClass('availabilityInfo')
        .css({
          display: 'none',
          position: 'absolute',
          top: -8,
          left: 50,
          border: '1px solid black',
          padding: 4,
          backgroundColor: 'white',
          zIndex: 8
        })
        .attr('data-bind', 'click: ' + hide.toString())
        .appendTo(container);

      $('<div>')
        .css({
          textAlign: 'left',
          whiteSpace: 'nowrap'
        })
        .attr('data-bind', 'html: _availableInfo')
        .appendTo(div);

      var span = $('span', container),
          bind = span.attr('data-bind');
      span.attr('data-bind', bind + ', click: ' + show.toString());
    }

    div = $('<div id="reactOrderPrimeCost">').appendTo(container);

    var orderPositionsField = [
      { title: '', bind: 'text', var: '"::::"', cls: 'handle'},
      { title: '', bind: 'checked', var: '_isSelected'},
      { title: 'Товар', bind: 'text', var: '_name', href: "'https://online.moysklad.ru/app/#good/edit?id='+goodUuid()" },
      { title: 'Тех. карта', bind: 'value', var: '_quantityPerPresent', cls: 'tar' },
      { title: '', bind: 'text', var: '_unit' },
      { title: 'Кол-во', bind: 'text', var: '_quantity', cls: 'tar' },
      { title: 'Доступно', bind: 'text', var: '_available', cls: 'tar', custom: modifyFieldAvailability },
      { title: 'Резерв', bind: 'text', var: 'reserve', cls: 'tar' },
      { title: 'Цена', bind: 'value', var: '_price', cls: 'tar w80' },
      { title: 'НДС, %', bind: 'text', var: 'vat', cls: 'tar' },
      { title: 'Сумма НДС', bind: 'text', var: '_sVat', cls: 'tar' },
      { title: 'Итого', bind: 'text', var: '_sTotal', cls: 'tar' },
      { title: '', bind: 'text', var: "'x'", cls: 'removePosition', click: '_onRemove'},
    ];

    require('./utils').createBindedTable(
      table, orderPositionsField, "selectedOrder().customerOrderPosition()"
    );

    table.appendTo(container);

    div = $('<div>')
      .css({
        position: 'relative',
      })
      .appendTo(container);

    $('<button>')
      .text('Обновить позиции в соответствии с текущим проектом')
      .css({
        padding: 4,
        margin: 12,
      })
      .attr('data-bind', 'click: onCreateGoodsForOrder')
      .appendTo(div);


    $('<div>')
      .text('Комментарий к заказу:')
      .css({
        margin: 12,
      })
      .appendTo(div);
    $('<textarea>')
      .attr('data-bind', 'value: selectedOrder().description')
      .css({
        width: 600,
        height: 80,
        margin: 12,
      })
      .appendTo(div);
  }
}
