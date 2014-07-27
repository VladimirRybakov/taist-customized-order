function init() {
  var $api
    , $log
    , $client
    , $vm = {}
    , $div
    , script;

  window.$vm = $vm;

  script = document.createElement('script');
  script.src = "https://cdnjs.cloudflare.com/ajax/libs/knockout/3.1.0/knockout-min.js";
  document.head.appendChild(script);

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
        plan, materials;

    for(i = 0, l = plans.length; i < l; i += 1) {
      plan = plans[i];

      materials = {};
      for(j = 0, k = plan.material.length; j < k; j += 1 ) {
        materials[plan.material[j].goodUuid] = plan.material[j].quantity;
      }

      $vm.processingPlans.push({
        uuid: plan.uuid,
        name: plan.name,
        data: plan,
        materials: materials,
      });
    }
  }

  function onNewCustomOrder() {
    $log('onNewCustomOrder', $vm.selectedPlan());
    var i,
        materials = $vm.selectedPlan().data.material,
        posinionsQuantity = materials.length,
        uuid,
        quantities = {},
        positions = []

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
          }
        });

        if(positions.length === posinionsQuantity) {

          var order = {
            vatIncluded: true,
            applicable: true,
            sourceStoreUuid: "123f239f-0216-11e4-4d38-002590a28eca",
            payerVat: true,
            sourceAgentUuid: "123fbe60-0216-11e4-4cbf-002590a28eca",
            targetAgentUuid: "123da6d2-0216-11e4-3a51-002590a28eca",
            moment: new Date(),
            name: new Date().getTime().toString(),
            customerOrderPosition: positions
          }

          $client.save("moysklad.customerOrder", order, function(dummy, order){
            $api.companyData.set(order.uuid, {
              uuid: order.uuid,
              baseTemplate: $vm.selectedPlan().data.uuid,
              presentsCount: 10
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


    return koData;
  }

  function onSaveOrder() {
    $log('onSaveOrder');

    var order = ko.mapping.toJS($vm.currentOrder);

    $client.save("moysklad.customerOrder", order, function(dummy, order){
      $log('Order saved');
      $api.companyData.set(order.uuid, {
        uuid: order.uuid,
        baseTemplate: $vm.selectedPlan().data.uuid,
        presentsCount: $vm.currentOrder()._presentsCount(),
      }, function(error){
        location.hash = '#customerorder/edit?id=' + order.uuid;
      })
    });

  };

  function onEditCustomerOrder() {
    var i, l, order, positions,
        uuid = location.hash.match(/id=(.+)/)[1];
    $log('onEditCustomerOrder', uuid);

    $client.load('CustomerOrder', uuid, function(dummy, orderData){
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

      $vm.currentOrder(order);

      order._presentsCount = ko.observable(1);

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

      $api.companyData.get(uuid, function(error, result) {
        $vm.selectedPlan(
          ko.utils.arrayFirst($vm.processingPlans(), function(plan) {
            return plan.uuid == result.baseTemplate;
          })
        );

        order._presentsCount(result.presentsCount || 1);
      });

      $api.wait.elementRender('.all-goods-table:visible', function(){
        $log('applyBindings for customerOrder');
        var elem = $('#taist_allGoods')[0],
            btn,
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
        }

        $('tbody tr', elem).not(':first').remove()

        ko.cleanNode(elem);
        ko.applyBindings($vm, elem);
        $(elem).prependTo( $('.all-goods-table').parent() );
      });

    });
  }

  function onChangeHash() {
    var hash = location.hash;

    if(/#customerorder$/.test(hash)){
      $('#onCustomerOrder').show();
      return onCustomerOrder();
    }
    else{
      $('#onCustomerOrder').hide();
    }

    if(/#customerorder\/edit/.test(hash)){
      return onEditCustomerOrder();
    }

  }

  function onStart() {
    $log('onStart');

    waitForKnockout(20, function(){
      $client = require('moysklad-client').createClient();
      $vm.companyUuid = $client.from('MyCompany').load()[0].uuid;

      $api.companyData.setCompanyKey($vm.companyUuid);

      //Fixed bug with moysklad-client
      require('xmldom').DOMImplementation = function(){
        this.createDocument = function(){
          return document.implementation.createDocument('', '', null);
        }
        return this;
      }

      $div = $('<div id="taist">')
        .css({display: 'none'})
        .prependTo('body');

      $("<select>")
        .attr('id', 'taist_processingPlans')
        .attr('data-bind', "options: processingPlans, optionsText: 'name', value: selectedPlan")
        .css({ width: '100%' })
        .appendTo($div);

      $vm.processingPlans = ko.observableArray([]);
      $vm.selectedPlan = ko.observable(null);

      var processingPlans = $client.from('ProcessingPlan').load();
      parseProcessingPlans(processingPlans);

      ko.applyBindings($vm, $div[0]);

      $vm.goods = {}
      $vm.customerOrders = {};
      $vm.currentOrder = ko.observable(null);
      $vm.presentsCount = ko.observable(1);

      $vm.currentOrderPositions = ko.observableArray([]);

      var allGoods = $('<div id="taist_allGoods" data-bind="if: currentOrder() !== null">'),
          div,
          table  = $('<table>')
            .addClass('taist-table'),
          thead  = $('<thead>').appendTo(table),
          trhead = $('<tr>').appendTo(thead),
          tbody  = $('<tbody data-bind="foreach: currentOrder().customerOrderPosition()">').appendTo(table),
          trbody = $('<tr>').appendTo(tbody);

      div = $('<div>')
        .attr('data-bind', 'if: selectedPlan() !== null')
        .appendTo(allGoods);
      $('<span>')
        .text('Базовая технологическая карта')
        .appendTo(div);
      $('<span>')
        .addClass('ml20 bold')
        .attr('data-bind', 'text: selectedPlan().name')
        .appendTo(div);

      div = $('<div>').appendTo(allGoods);
      $('<span>')
        .text('Количество подарков')
        .appendTo(div);
      $('<input>')
        .addClass('tar')
        .attr('data-bind', 'value: currentOrder()._presentsCount')
        .css({ width: 40, marginLeft: 20})
        .appendTo(div);

      div = $('<div>').appendTo(allGoods);
      $('<span>')
        .text('Итого:')
        .appendTo(div);
      $('<span>')
        .addClass('ml20 bold fs125')
        .attr('data-bind', 'text: currentOrder()._sTotal')
        .appendTo(div);

      div = $('<div>').appendTo(allGoods);
      $('<span>')
        .text('НДС:')
        .appendTo(div);
      $('<span>')
        .addClass('ml20')
        .attr('data-bind', 'text: currentOrder()._sVat')
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
      ].map(function(item){
        $('<td>').text(item.title).appendTo(trhead);
        var td = $('<td>')
          .addClass(item.cls || '')
          .addClass(item.var)
          .appendTo(trbody);

        $(item.bind == 'value' ? '<input>' : '<span>')
          .attr("data-bind", item.bind + ":" + item.var)
          .appendTo(td);
      })

      table.appendTo(allGoods);
      allGoods.appendTo($div);

      $api.hash.onChange(onChangeHash);
      onChangeHash(location.hash);
    });
  }

  var addonEntry = {
    start: function(_taistApi, entryPoint) {
      $api = _taistApi;
      window.$api = $api;

      $log = $api.log;
      onStart();
    }
  };

  return addonEntry;
}
