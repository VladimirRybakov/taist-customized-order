var $api
  , $log
  , $client
  , $vm = {}
  , $div
  , $goodsDOMNode
  , sctipt

  , $app = {
    changeState: function(name, data){
      $state.push({
        name: name,
        data: data
      })
    },

    getLastState: function(){
      return $state[$state.length - 1];
    },

    getFirstState: function(){
      return $state[0];
    },

    options: {
      orderTemplatesGroupUuid: 'dd17179f-15d2-11e4-7a1b-002590a28eca', // Заказы
    },
  }

  , $state = []
  , STATE = require('./state')
  ;

window.$vm = $vm;

script = document.createElement('script');
script.src = "https://cdnjs.cloudflare.com/ajax/libs/knockout/3.1.0/knockout-min.js";
document.head.appendChild(script);

function parseOrderData(order){
  var labels  = $('.b-operation-form-top td.label'),
      widgets = $('.b-operation-form-top td.widget input:visible'),
      i, l,
      label,
      key,
      mapping = {
        'Организация': '_company',
        'Контрагент': '_customer',
        'Сотрудник': '_manager',
        'Склад': '_store',
        'Договор': '_contract',
        'План. дата отгрузки': '_date',
      };

  for(i = 0, l = labels.length; i < l; i += 1) {
    label = $(labels[i]).text();
    key = mapping[label]
    if(typeof key !== 'undefined') {
      if(typeof order[key] != 'function') {
        order[key] = ko.observable('');
      }
      order[key]( $(widgets[i]).val() );
    }
  }
}

function waitForObject(count, parent, objectName, callback){
  if(count > -1) {
    if(typeof(parent[objectName]) !== 'object') {
      setTimeout(function(){
        waitForObject(count - 1, parent, objectName, callback);
      }, 50)
    }
    else {
      callback();
    }
  }
}

function waitForKnockout(count, callback){
  waitForObject(count, window, 'ko', function(){
    script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/knockout.mapping/2.4.1/knockout.mapping.min.js";
    document.head.appendChild(script);
    waitForObject(20, ko, 'mapping', function(){
      callback();
    });
  });
}

function parseProcessingPlans(plans) {
  var i, l, j, k,
      plan;

  for(i = 0, l = plans.length; i < l; i += 1) {
    plan = plans[i];

    if(plan.material) {
      var materials = {};

      for(j = 0, k = plan.material.length; j < k; j += 1 ) {
        materials[plan.material[j].goodUuid] = plan.material[j].quantity;
      }

      $vm.processingPlans.remove(function(item) {
        return item.uuid === plan.uuid
      });

      $vm.processingPlans.push({
        uuid: plan.uuid,
        name: plan.name,
        data: plan,
        materials: materials,
      });
    }
  }
}

function onNewCustomOrder() {
  $log('onNewCustomOrder', $vm.basePlan());
  var i,
      materials = $vm.basePlan().data.material,
      posinionsQuantity = materials.length,
      uuid,
      quantities = {},
      positions = []

  var ts = new Date().getTime()
  for(i = 0; i < posinionsQuantity; i++) {
    uuid = materials[i].goodUuid;
    quantities[uuid] = materials[i].quantity

      $client.load('Good', uuid, function(dummy, good){
        positions.push({
          vat: 18,
          goodUuid: good.uuid,
          quantity: quantities[good.uuid],
          discount: 0,
          reserve: 0,
          basePrice: {
            sum: good.salePrice,
            sumInCurrency: good.salePrice
          },
          price: {
            sum: good.salePrice,
            sumInCurrency: good.salePrice
          },
        });

        $log(positions);

        if(positions.length === posinionsQuantity) {

          var order = {
            vatIncluded: true,
            applicable: true,
            sourceStoreUuid: $vm.selectedWarehouse().uuid, // основной склад
            payerVat: true,
            // sourceAgentUuid: "", // контрагент
            targetAgentUuid: $vm.selectedCompany().uuid, // моя компания
            moment: new Date(),
            name: new Date().getTime().toString(),
            customerOrderPosition: positions
          }

          $client.save("moysklad.customerOrder", order, function(dummy, order){
            $api.companyData.set(order.uuid, {
              uuid: order.uuid,
              baseTemplate: $vm.basePlan().data.uuid,
              orderTemplate: '',
              presentsCount: 10,
            }, function(error){
              location.hash = '#customerorder/edit?id=' + order.uuid;
            })
          });
        }

      });

  }
}

function onCustomerOrder() {
  $log('onCustomerOrder');
  $api.wait.elementRender('.pump-title-panel:visible', function(){

    var container = $('>tbody', '.pump-title-panel:visible'),
        td = $('.taist_container', container),
        tr,
        originalButton;

    if(td.length === 0) {
      tr = $('<tr id="onCustomerOrder">');
      td = $('<td>')
        .addClass('taist_container')
        .attr('colspan', 3)
        .css({ paddingRight: '10px'})
        .appendTo(tr);
      tr.appendTo(container);

      originalButton = $($('>tr>td', container)[1]);
      originalButton
        .clone()
        .appendTo(tr)
        .click(onNewCustomOrder);
    }

    $('#taist_processingPlans').appendTo(td);
  });

}

function createSumObject(options) {
  return ko.mapping.fromJS(
    options.data,
    {
      copy: ['TYPE_NAME']
    }
  );
}

// var $goodsQueue = [];
// function goodsQueue() {
//   var l = $goodsQueue.length, item;
//   if(l > 0) {
//     item = $goodsQueue.shift();
//     $client.load('Good', item.uuid, function(dummy, good){
//       setTimeout(goodsQueue, 42);
//       item.callback(dummy, good);
//     });
//   } else {
//     setTimeout(goodsQueue, 1000);
//   }
// }
// goodsQueue();

function createCustomerOrderPosition(options) {
  var koData = ko.mapping.fromJS(options.data, {
    basePrice: createSumObject,
    price: createSumObject,
    copy: [
      'TYPE_NAME',
      'accountId',
      'accountUuid',
      '//basePrice{}',
      'changeMode',
      'consignmentUuid',
      '//discount',
      '//goodUuid',
      '//price{}',
      '//quantity',
      'readMode',
      '//reserve',
      'uuid',
      '//vat',
    ]
  }),
  goodUuid = koData.goodUuid();

  if(!$vm.goods[goodUuid]) {
    $vm.goods[goodUuid] = {
      name: ko.observable(goodUuid)
    };

    $client.load('Good', goodUuid, function(dummy, good){
      $vm.goods[good.uuid].name(good.name);
    });
    // $goodsQueue.push({
    //   uuid: goodUuid,
    //   callback: function(dummy, good){
    //     $vm.goods[good.uuid].name(good.name);
    //   }
    // });
  }

  koData._name = $vm.goods[goodUuid].name;

  koData._price = ko.computed(function(){
    return (this.price.sum()/100).toFixed(2).replace('.', ',');
  }, koData);

  koData._vat = ko.computed(function(){
    var vat = (this.quantity() * this.price.sum() / 100 * this.vat() / (100 + this.vat()));
    return Math.round(vat * 100) / 100;
  }, koData);

  koData._sVat = ko.computed(function(){
    return this._vat().toFixed(2).replace('.', ',');
  }, koData);

  koData._total = ko.computed(function(){
    return (this.quantity() * this.price.sum() / 100);
  }, koData);

  koData._sTotal = ko.computed(function(){
    return this._total().toFixed(2).replace('.', ',');
  }, koData);

  koData._quantityPerPresent = ko.observable(
    $vm.selectedPlan().materials[koData.goodUuid()] || 1
  );

  koData._onRemove = function(){
    $vm.selectedOrder().customerOrderPosition.remove(this);
  }

  return koData;
}

function onSaveOrder() {
  $log('onSaveOrder');

  var order = ko.mapping.toJS($vm.selectedOrder),
      i, l,
      plan,
      m,
      materials = [],
      products = [],
      templateUuid = $vm.selectedOrder()._template(),

      saveOrder = function(templateUuid){
        $client.save("moysklad.customerOrder", order, function(dummy, order){
          $log('Order saved');
          $api.companyData.set(order.uuid, {
            uuid: order.uuid,
            baseTemplate: $vm.basePlan().data.uuid,
            orderTemplate: templateUuid,
            presentsCount: $vm.selectedOrder()._presentsCount(),
          }, function(error){
            location.reload();
            //location.hash = '#customerorder/edit?id=' + order.uuid;
          })
        });
      },

      prepareMaterials = function(plan){
        for(i = 0, l = $vm.selectedOrder().customerOrderPosition().length; i < l; i += 1) {
          m = $vm.selectedOrder().customerOrderPosition()[i];
          materials.push({
            TYPE_NAME: "moysklad.material",
            planUuid: plan.uuid,
            accountId: m.accountId,
            accountUuid: m.accountUuid,
            changeMode: "NONE",
            goodUuid: m.goodUuid(),
            quantity: parseInt(m._quantityPerPresent(), 10),
            readMode: "ALL"
          });
        }
        return materials;
      };

  plan = $.extend(true, {}, $vm.selectedPlan().data);
  plan.name = order.name;
  plan.parentUuid = $vm.orderPlanFolder().uuid;

  if(templateUuid === '') {
    plan.material = [];
    products = plan.product;
    plan.product = [];
    delete(plan.uuid);

    $client.save("moysklad.processingPlan", plan, function(error, plan){

      plan.material = prepareMaterials(plan)

      for(i = 0, l = products.length; i < l; i += 1) {
        products[i].planUuid = plan.uuid;
        delete(products[i].uuid);
      }
      plan.product = products;

      $client.save("moysklad.processingPlan", plan, function(error, plan){
        $log('New plan saved', plan);
        parseProcessingPlans([plan]);
      });

      saveOrder(plan.uuid);
    });
  } else {
      plan.material = prepareMaterials(plan)
      $client.save("moysklad.processingPlan", plan, function(error, plan){
        $log('Plan updated', plan);
        parseProcessingPlans([plan]);
      });
      saveOrder(plan.uuid);
  }

};

function onEditCustomerOrder() {
  var i, l, order, positions,
      uuid = location.hash.match(/id=(.+)/)[1];

  $log('onEditCustomerOrder', uuid);

  $goodsDOMNode.hide();
  ko.cleanNode($goodsDOMNode[0]);
  $('tbody tr', $goodsDOMNode).not(':first').remove();

  $api.companyData.get(uuid, function(error, taistOrderData) {

    $vm.basePlan(
      ko.utils.arrayFirst($vm.processingPlans(), function(plan) {
        return plan.uuid == taistOrderData.baseTemplate;
      })
    );

    var selected = ko.utils.arrayFirst($vm.processingPlans(), function(plan) {
      return plan.uuid == (taistOrderData.orderTemplate || taistOrderData.baseTemplate);
    })

    if(selected == null) {
      //Reset order template because it is not found
      taistOrderData.orderTemplate = '';
    }

    $vm.selectedPlan(selected || $vm.basePlan());

    $log($vm.basePlan(), $vm.selectedPlan());

    $client.load('CustomerOrder', uuid, function(dummy, orderData){

      var good;
      order = $.extend({}, orderData);
      lazyLoader = $client.createLazyLoader();
      lazyLoader.attach(order, ['customerOrderPosition.good']);
      for(i = 0, l = order.customerOrderPosition.length; i < l; i += 1) {
        good = order.customerOrderPosition[i].good;
        if(!$vm.goods[good.uuid]) {
          $vm.goods[good.uuid] = {
            name: ko.observable(good.name)
          };
        }
      }

      $vm.customerOrders[uuid] = ko.mapping.fromJS(orderData, {
        sum: {
          create: createSumObject
        },
        customerOrderPosition: {
          create: createCustomerOrderPosition
        },
        copy: [
          'TYPE_NAME',
          'accountId',
          'accountUuid',
          'applicable',
          'changeMode',
          'created',
          'createdBy',
          '//customerOrderPosition[]',
          'externalcode',
          'moment',
          '//name',
          'payerVat',
          'rate',
          'readMode',
          'sourceAccountUuid',
          'sourceAccountUuid',
          'sourceAgentUuid',
          'sourceStoreUuid',
          '//sum{}',
          'targetAccountUuid',
          'targetAgentUuid',
          'updated',
          'updatedBy',
          'uuid',
          'vatIncluded',
        ]
      }, {});

      order = $vm.customerOrders[uuid];

      $vm.selectedOrder(order);

      order._presentsCount = ko.observable(taistOrderData.presentsCount || 1);
      order._template = ko.observable(taistOrderData.orderTemplate || '');

      positions = order.customerOrderPosition();

      for(i = 0, l = positions.length; i < l; i +=1){
        positions[i]._quantity = ko.computed(function(){
          var quantity = this._quantityPerPresent() * order._presentsCount();
          this.quantity(quantity);
          return quantity;
        }, positions[i]);
      }

      order._total = ko.computed(function(){
        var sum = 0;
        this.customerOrderPosition().map(function(item){
          sum += item._total();
        })
        order.sum.sum(Math.round(sum * 100));
        order.sum.sumInCurrency(Math.round(sum * 100));
        return sum;
      }, order);

      order._sTotal = ko.computed(function(){
        return this._total().toFixed(2).replace('.', ',');
      }, order);

      order._vat = ko.computed(function(){
        var sum = 0;
        this.customerOrderPosition().map(function(item){
          sum += item._vat();
        })
        return sum;
      }, order);

      order._sVat = ko.computed(function(){
        return this._vat().toFixed(2).replace('.', ',');
      }, order);

      order._customer = ko.observable('');

      order._name = ko.computed(function(){
        var name = $vm.basePlan().name
          + ' - ' + this._customer()
          + ' - ' + this._presentsCount() + 'шт.';
        this.name(name);
        return name;
      }, order);

      parseOrderData(order);

      $api.wait.elementRender('.all-goods-table', function(){
        $log('applyBindings for customerOrder');

        var originalGoodsTable = $('.all-goods-table');

        var btn,
            div = $('#onSaveOrder');

        if(div.size() === 0) {
          btn = $('.b-editor-toolbar .b-popup-button-green').parent(),
          div = $('<div id="onSaveOrder">')
            .css({
              width: btn.width() - 10,
              height: btn.height() - 3,
            })
            .addClass('taist-onSaveOrder')
            .click(function(event){
              onSaveOrder();
            })
            .appendTo(btn);

          var buttons = $('[role=button]', '.all-goods-table-buttons');
          buttons.click(function(event){
            var buttonName = $(event.target).text(),
                selector,
                element;

            $log(buttonName);
            switch(buttonName){
              case 'Добавить позицию':
                $app.changeState(STATE.ORDER.newGoodWaited);
                break;
            }
          });
        }

        ko.applyBindings($vm, $goodsDOMNode[0]);
        $goodsDOMNode.appendTo( originalGoodsTable.parent() );
        $goodsDOMNode.show();
      });

    });
  });
}

function onChangeHash() {
  var hash = location.hash;

  $state = [];

  if(/#customerorder$/.test(hash)){
    $('#onCustomerOrder').show();
    return onCustomerOrder();
  }
  else{
    $('#onCustomerOrder').hide();
  }

  if(/#customerorder\/edit/.test(hash)){
    $app.changeState(STATE.APP.orderOpened);
    $('#site').addClass('newOrderInterface');
    return onEditCustomerOrder();
  }
  else{
    $('#site').removeClass('newOrderInterface');
  }
}

function createSettingsInterface(taistOptions) {

  $log('createSettingsInterface', taistOptions);
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
    $log('saveTaistOptions');

    $api.companyData.set('taistOptions', {
      basePlanFolder:    ($vm.basePlanFolder()    || {}).uuid,
      orderPlanFolder:   ($vm.orderPlanFolder()   || {}).uuid,
      selectedWarehouse: ($vm.selectedWarehouse() || {}).uuid,
      selectedCompany:   ($vm.selectedCompany()   || {}).uuid,
    }, function(){});
  }

  var container = $('.b-main-panel .info tr'),
      td = $('<td align="left" style="vertical-align: top; padding-left: 20px;">')
        .appendTo(container),
      div = $('<div>')
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
        .html("<h2>Настройки</h2>")
        .appendTo(td);

  $('<img src="http://www.tai.st/images/logo_sq_180.png">')
    .css({
      width: 24,
      cursor: 'pointer',
    })
    .click(function(){
      $(div).toggle();
    })
    .appendTo(td);

  var processingPlanFolders = $client.from('ProcessingPlanFolder').load();
  $vm.processingPlanFolders = ko.observableArray(
    parseCollection(processingPlanFolders, 'moysklad.processingPlanFolder')
  );

  $vm.basePlanFolder = ko.observable(
    ko.utils.arrayFirst($vm.processingPlanFolders(), function(plan) {
        return plan.uuid == taistOptions.basePlanFolder;
    })
  );

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
  );

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

  return div;
}

function onStart(_taistApi) {
  $api = _taistApi;
  window.$api = $api;

  var globals = require("./globals")

  globals.set('app', $app);
  globals.set('api', $api);
  globals.set('log', $api.log);
  $log = globals.log;

  $log('onStart');

  waitForKnockout(20, function(){
    $client = window.require('moysklad-client').createClient();
    $client.setAuth('admin@ntts', '15c316837613');

    globals.set('client', $client);
    var handlers = require("./xmlhttphandlers");
    require("./xmlhttpproxy").registerHandlers( handlers );

    $vm.companyUuid = $client.from('MyCompany').load()[0].uuid;

    $api.companyData.setCompanyKey($vm.companyUuid);

    //Fixed bug with moysklad-client
    window.require('xmldom').DOMImplementation = function(){
      this.createDocument = function(){
        return document.implementation.createDocument('', '', null);
      }
      return this;
    }

    $api.companyData.get('taistOptions', function(error, taistOptions){

      taistOptions || (taistOptions = {});

      $div = $('<div id="taist">')
        .css({display: 'none'})
        .prependTo('body');

      $("<select>")
        .attr('id', 'taist_processingPlans')
        .attr('data-bind', "options: baseProcessingPlans, optionsText: 'name', value: basePlan")
        .css({ width: '100%' })
        .appendTo($div);

      $vm.processingPlans = ko.observableArray([]);

      $vm.selectedPlan = ko.observable(null);
      $vm.basePlan = ko.observable(null);

      var processingPlans = $client.from('ProcessingPlan').load();
      parseProcessingPlans(processingPlans);

      $vm.baseProcessingPlans = ko.computed(function(){
        return ko.utils.arrayFilter($vm.processingPlans(), function(plan) {
          return plan.data.parentUuid === taistOptions.basePlanFolder;
        });
      }).extend({ throttle: 1 });

      var settingsDiv = createSettingsInterface(taistOptions);

      ko.applyBindings($vm, $div[0]);
      ko.applyBindings($vm, settingsDiv[0]);

      $vm.goods = {}
      $vm.customerOrders = {};
      $vm.selectedOrder = ko.observable(null);
      $vm.presentsCount = ko.observable(1);

      $vm.selectedOrderPositions = ko.observableArray([]);

      $goodsDOMNode = $('<div id="taist_allGoods" data-bind="if: selectedOrder() !== null">');

      var div,
          table  = $('<table>')
            .addClass('taist-table'),
          thead  = $('<thead>').appendTo(table),
          trhead = $('<tr>').appendTo(thead),
          tbody  = $('<tbody data-bind="foreach: selectedOrder().customerOrderPosition()">').appendTo(table),
          trbody = $('<tr>').appendTo(tbody);

      div = $('<div>')
        .attr('data-bind', 'if: basePlan() !== null')
        .appendTo($goodsDOMNode);
      $('<span>')
        .text('Базовая технологическая карта')
        .appendTo(div);
      $('<span>')
        .addClass('ml20 bold')
        .attr('data-bind', 'text: basePlan().name')
        .appendTo(div);

      div = $('<div>')
        .appendTo($goodsDOMNode);
      $('<span>')
        .text('Название заказа')
        .appendTo(div);
      $('<span>')
        .addClass('ml20 bold')
        .attr('data-bind', 'text: selectedOrder().name')
        .appendTo(div);

      div = $('<div>').appendTo($goodsDOMNode);
      $('<span>')
        .text('Количество подарков')
        .appendTo(div);
      $('<input>')
        .addClass('tar')
        .attr('data-bind', 'value: selectedOrder()._presentsCount')
        .css({ width: 40, marginLeft: 20})
        .appendTo(div);

      div = $('<div>').appendTo($goodsDOMNode);
      $('<span>')
        .text('Итого:')
        .appendTo(div);
      $('<span>')
        .addClass('ml20 bold fs125')
        .attr('data-bind', 'text: selectedOrder()._sTotal')
        .appendTo(div);

      div = $('<div>').appendTo($goodsDOMNode);
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

      table.appendTo($goodsDOMNode);
      $goodsDOMNode.appendTo($div);

      $api.hash.onChange(onChangeHash);
      onChangeHash(location.hash);
    });
  });
}

module.exports = onStart
