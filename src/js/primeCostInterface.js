module.exports = {
  create: function(container){
    var table = $('<table class="taistTable primeCost">'),
        primeCostFields = [
          { title: 'Количество', bind: 'value', var: 'quantity', cls: 'tar' },
          { title: 'Скидка', bind: 'value', var: 'discount', cls: 'tar' },
          { title: 'Цена', bind: 'text', var: 'cost', cls: 'tar' },
          { title: 'Заработок', bind: 'text', var: 'income', cls: 'tar' },
          { title: 'Маржа', bind: 'text', var: 'total', cls: 'tar' },
        ];

    require('./utils').createBindedTable(
      table, primeCostFields, "primeCost()"
    );

    table.appendTo(container);
  }
}
