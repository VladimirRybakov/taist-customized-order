var $api = require('./globals/api'),
    $client = require('./globals/client'),
    $vm = require('./globals/vm');

module.exports = {
  create: function (taistOptions) {

    taistOptions || (taistOptions = {})

    function parseCollection(collection, type) {
      var result = [],
          i = 0,
          l = collection.length;

      for(; i < l; i += 1) {
        if(type && collection[i].TYPE_NAME !== type) {
          continue;
        }
        result.push({
          uuid: collection[i].uuid,
          name: collection[i].name,
        });
      }

      return result;
    }

    var div = $('<div>')
          .css({
            position: 'absolute',
            top: 32,
            right: 64,
            display: 'none',
            background: 'rgba(220, 228, 220, 0.9)',
            padding: 20,
            zIndex: 1024,
          })
          .addClass('taist-options')
          .html("<h2>Настройки</h2>");

    if(typeof taistOptions.processingPlansFolder === 'undefined') {
      var processingPlanFolders = $client.from('ProcessingPlanFolder').load();
      $vm.processingPlanFolders = ko.observableArray(
        parseCollection(processingPlanFolders, 'moysklad.processingPlanFolder')
      ).extend({ rateLimit: 50 });
    } else {
      $vm.processingPlanFolders = ko.observableArray(taistOptions.processingPlansFolder);
    }

    $vm.basePlanFolder = ko.observable(
      ko.utils.arrayFirst($vm.processingPlanFolders(), function(plan) {
          return plan.uuid == taistOptions.basePlanFolder;
      })
    ).extend({ rateLimit: 50 });

    $("<div>")
      .text("Папка с базовыми технологическими картами/шаблонами")
      .appendTo(div);
    $("<select>")
      .attr('data-bind', "options: processingPlanFolders, optionsText: 'name', value: basePlanFolder")
      .css({ width: 400 })
      .appendTo(div);

    $vm.orderPlanFolder = ko.observable(
      ko.utils.arrayFirst($vm.processingPlanFolders(), function(plan) {
          return plan.uuid == taistOptions.orderPlanFolder;
      })
    ).extend({ rateLimit: 50 });

    $("<div>").appendTo(div);
    $("<button>")
      .text("Очистить список шаблонов")
      .click(function(){
        $vm.processingPlans.removeAll();
        saveTaistOptions();
      })
      .appendTo(div);

    $("<div>")
      .text("Папка для производных технологических карт")
      .appendTo(div);
    $("<select>")
      .attr('data-bind', "options: processingPlanFolders, optionsText: 'name', value: orderPlanFolder")
      .css({ width: 400 })
      .appendTo(div);

    var warehouses = $client.from('Warehouse').load()
    $vm.warehouses = ko.observableArray(
      parseCollection(warehouses)
    )
    $vm.selectedWarehouse = ko.observable(
      ko.utils.arrayFirst($vm.warehouses(), function(warehouse) {
          return warehouse.uuid == taistOptions.selectedWarehouse;
      })
    );

    $("<div>")
      .text("Склад по умолчанию")
      .appendTo(div);
    $("<select>")
      .attr('data-bind', "options: warehouses, optionsText: 'name', value: selectedWarehouse")
      .css({ width: 400 })
      .appendTo(div);

    var companies = $client.from('MyCompany').load()
    $vm.companies = ko.observableArray(
      parseCollection(companies)
    )
    $vm.selectedCompany = ko.observable(
      ko.utils.arrayFirst($vm.companies(), function(company) {
          return company.uuid == taistOptions.selectedCompany;
      })
    );

    $("<div>")
      .text("Компания/юридическое лицо по умолчанию")
      .appendTo(div);
    $("<select>")
      .attr('data-bind', "options: companies, optionsText: 'name', value: selectedCompany")
      .css({ width: 400 })
      .appendTo(div);

    [
      { name: 'Interest', desc: 'Процент'},
      { name: 'Tax', desc: 'Налог'},
      { name: 'Output', desc: 'Выдача'},
      { name: 'Package', desc: 'Транспортная упаковка'},
      { name: 'Risk', desc: 'Риск (% от стоимости)'},
    ].forEach(function(param){
        var name = 'primeCost' + param.name,
            desc = 'Себестоимость. ' + param.desc;

        $('<div>').text(desc).appendTo(div);
        $('<input>')
          .attr('data-bind', 'value: ' + name)
          .css({ width: 400, textAlign: 'right' })
          .appendTo(div);
    });

    $('<div>')
      .text('Имя пользователя / Пароль')
      .appendTo(div);
    $('<input>')
      .attr('data-bind', 'value: moyskladClientUser')
      .css({ width: 190 })
      .appendTo(div);

    $('<input>')
      .attr('data-bind', 'value: moyskladClientPass')
      .attr('type', 'password')
      .css({ marginLeft: 20, width: 190 })
      .appendTo(div);

    $vm.saveTaistOptions = function() {
      require('./utils').saveTaistOptions();
    }

    $("<div>").appendTo(div);
    $('<button>')
      .text("Сохранить настройки")
      .attr('data-bind', 'click: saveTaistOptions')
      .appendTo(div);

    return div;
  }

}
