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

    function saveTaistOptions(){
      var processingPlans = [];
      $vm.baseProcessingPlans().forEach(function(plan){
        processingPlans.push(plan.data);
      })

      if(processingPlans.length === 0) {
        processingPlans = undefined;
      }

      $api.companyData.set('taistOptions', {
        basePlanFolder:     ($vm.basePlanFolder()     || {}).uuid,
        orderPlanFolder:    ($vm.orderPlanFolder()    || {}).uuid,
        selectedWarehouse:  ($vm.selectedWarehouse()  || {}).uuid,
        selectedCompany:    ($vm.selectedCompany()    || {}).uuid,

        processingPlans:    processingPlans,
        processingPlansFolder: $vm.processingPlanFolders(),

        // moyskladClientUser: $vm.moyskladClientUser(),
        // moyskladClientPass: $vm.moyskladClientPass(),
      }, function(){});

      $api.userData.set('taistOptions', {
        moyskladClientUser: $vm.moyskladClientUser(),
        moyskladClientPass: $vm.moyskladClientPass(),
      }, function(){});
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
          // .appendTo(td);

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
      .text("Очистить список шалбонов")
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

    $vm.basePlanFolder.subscribe(saveTaistOptions);
    $vm.orderPlanFolder.subscribe(saveTaistOptions);
    $vm.selectedWarehouse.subscribe(saveTaistOptions);
    $vm.selectedCompany.subscribe(saveTaistOptions);

    $('<div>')
      .text('Имя пользователя')
      .appendTo(div);
    $('<input>')
      .attr('data-bind', 'value: moyskladClientUser')
      .css({ width: 400 })
      .appendTo(div);

    $('<div>')
      .text('Пароль')
      .appendTo(div);
    $('<input>')
      .attr('data-bind', 'value: moyskladClientPass')
      .attr('type', 'password')
      .css({ width: 400 })
      .appendTo(div);

    $vm.moyskladClientUser.subscribe(saveTaistOptions);
    $vm.moyskladClientPass.subscribe(saveTaistOptions);

    return div;
  }

}
