module.exports = {
  create: function(container){
    var div,
        table  = $('<table>').addClass('taist-table');

    var orderFields = [
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
        css: { width: 200, marginLeft: 20}
      },

      {
        name: 'Количество подарков', cls: 'tar', elem: 'input',
        bind: 'value: selectedOrder()._presentsCount',
        css: { width: 60, marginLeft: 20}
      },

      { name: '', cls: '', bind: '' },

      { name: 'Себестоимость 30 (1 шт):', cls: 'ml20 bold fs125', bind: 'text: selectedOrder()._sPricePerPresent' },
      { name: 'Себестоимость 30 (итого):', cls: 'ml20', bind: 'text: selectedOrder()._sTotal' },
      { name: 'Итого (+ упаковка и риски):', cls: 'ml20', bind: 'text: selectedOrder()._sTotalWithPackageAndRisks' },
      { name: 'НДС:', cls: 'ml20', bind: 'text: selectedOrder()._sVat' },

      { name: '', cls: '', bind: '' },

      { name: 'Себестоимость 100 (1 шт):', cls: 'ml20 bold fs125', bind: 'text: selectedOrder()._sMinPricePerPresent' },
      { name: 'Себестоимость 100 (итого):', cls: 'ml20', bind: 'text: selectedOrder()._sMinTotal' },
      { name: 'Итого (+ упаковка и риски):', cls: 'ml20', bind: 'text: selectedOrder()._sMinTotalWithPackageAndRisks' },

      { name: '', cls: '', bind: '' },

    ]

    div = $('<div class="persistent">')
      .css({
        position: 'relative',
      })
      .appendTo(container);

    $('<button>')
      .text('Показать/скрыть дополнительный интерфейс')
      .css({
        padding: 4,
        margin: 4,
      })
      .attr('data-bind', 'click: onToggleInterface')
      .appendTo(div);

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

    div = $('<div>')
      .css({
        position: 'relative',
      })
      .appendTo(container);

    $('<button>')
      .text('СОХРАНИТЬ ПОЗИЦИИ В ЗАКАЗЕ!')
      .css({
        padding: 4,
        margin: 4,
      })
      .attr('data-bind', 'click: onSaveOrder')
      .appendTo(div);

    div = $('<div id="reactOrderPrimeCost">').appendTo(container);

    var orderPositionsField = [
      { title: '', bind: 'text', var: '"::::"', cls: 'handle'},
      { title: '', bind: 'checked', var: '_isSelected'},
      { title: 'Товар', bind: 'text', var: '_name', href: "'https://online.moysklad.ru/app/#good/edit?id='+goodUuid()", cls: 'w300' },
      { title: 'Поставка', bind: 'text', var: '_deliveryTime', cls: 'w1' },
      { title: 'Тех. карта', bind: 'value', var: '_quantityPerPresent', cls: 'tar' },
      { title: '', bind: 'text', var: '_unit' },
      { title: 'Кол-во', bind: 'text', var: '_quantity', cls: 'tar' },
      { title: 'Доступно', bind: 'text', var: '_available', cls: 'tar', custom: modifyFieldAvailability },
      { title: 'Резерв', bind: 'text', var: 'reserve', cls: 'tar' },
      { title: 'Цена', bind: 'value', var: '_price', cls: 'tar w70' },
      { title: '', bind: 'text', var: '_buyPrice', cls: 'grey tar' },
      { title: 'Мин. цена', bind: 'value', var: '_minimalPrice', cls: 'tar w70' },
      { title: '', bind: 'text', var: '_minPrice', cls: 'grey tar' },
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
