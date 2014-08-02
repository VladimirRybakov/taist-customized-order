function init() {
  var $api
    , $log
    , $client
    , $vm = {}
    , $div
    , $goods
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
      }
    }

    , $state = []
    , STATE = {
        APP: {
          appStarted:      'appStarted',
        },
        ORDER: {
          newGoodWaited:   'newGoodWaited',
          newGoodSelected: 'newGoodSelected',
          newGoodAdded:    'newGoodAdded',
        },
      }
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

    var order = ko.mapping.toJS($vm.selectedOrder),
        i, l,
        plan,
        templateUuid = $vm.selectedOrder()._template(),
        save = function(templateUuid){
          $client.save("moysklad.customerOrder", order, function(dummy, order){
            $log('Order saved');
            $api.companyData.set(order.uuid, {
              uuid: order.uuid,
              baseTemplate: $vm.selectedPlan().data.uuid,
              orderTemplate: templateUuid,
              presentsCount: $vm.selectedOrder()._presentsCount(),
            }, function(error){
              location.hash = '#customerorder/edit?id=' + order.uuid;
            })
          });
        };

    save(templateUuid);

    // if(templateUuid === '') {
    //   plan = $.extend(true, {}, $vm.selectedPlan().data);
    //   plan.name = order.name;
    //   plan.parentUuid = 'dd17179f-15d2-11e4-7a1b-002590a28eca';
    //   for(i = 0, l = plan.material.length; i < l; i += 1) {
    //     delete(plan.material[i].uuid);
    //   }
    //   for(i = 0, l = plan.product.length; i < l; i += 1) {
    //     delete(plan.product[i].uuid);
    //   }
    //   delete(plan.uuid);
    //   $log(plan);
    //   $client.save("moysklad.processingPlan", plan, function(dummy, template){
    //     save(template.uuid);
    //   });
    // } else {
    //   save(templateUuid);
    // };

    // Шаблоны: 3bef3f09-15d2-11e4-c910-002590a28eca
    // Заказы:  dd17179f-15d2-11e4-7a1b-002590a28eca
  };

  function onEditCustomerOrder() {
    var i, l, order, positions,
        uuid = location.hash.match(/id=(.+)/)[1];

    $log('onEditCustomerOrder', uuid);

    $goods.hide();
    ko.cleanNode($goods[0]);
    $('tbody tr', $goods).not(':first').remove();

    $api.companyData.get(uuid, function(error, taistOrderData) {

      $vm.selectedPlan(
        ko.utils.arrayFirst($vm.processingPlans(), function(plan) {
          return plan.uuid == taistOrderData.baseTemplate;
        })
      );

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
          var name = $vm.selectedPlan().name
            + ' - ' + this._customer()
            + ' - ' + this._presentsCount() + 'шт.';
          this.name(name);
          return name;
        }, order);

        parseOrderData(order);

        $api.wait.elementRender('.all-goods-table:visible', function(){
          $log('applyBindings for customerOrder');
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

          ko.applyBindings($vm, $goods[0]);
          $goods.prependTo( $('.all-goods-table').parent() );
          $goods.show();
        });

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

    function registerXMLHttpHandlers(handlers) {
      var XMLHttpRequestSend = XMLHttpRequest.prototype.send;
      XMLHttpRequest.prototype.send = function() {
        var onReady = this.onreadystatechange,
            ts = new Date().getTime(),
            self = this;

        this._request = $.extend(true, {}, this);
        this._arguments = arguments;

        this.onreadystatechange = function(){
          if(self.readyState === 4) {
            var args = self._arguments[0],
                matches,
                service,
                method,
                handlerName;

            if(args) {
              matches = args.match(/com\.lognex\.([\w.]+)?\.([^.|]+)\|([^|]+)/);
              if(matches) {
                service = matches[2];
                method = matches[3];
                if(method !== 'ping') {
                  handlerName = service + '.' + method;
                  $log('OnResponse', ts, handlerName);
                  if(handlers && typeof handlers[handlerName] === 'function') {
                    handlers[handlerName](args, self.responseText);
                  }
                }
              }
            }
          }
          onReady && onReady.apply(self, arguments);
        }

        XMLHttpRequestSend.apply(this, arguments);
      }
    }

    registerXMLHttpHandlers({

      'CommonService.getItemTO': function(requestData, responseText){
        $log(requestData, responseText);
        if($app.getLastState().name !== STATE.ORDER.newGoodWaited)
        {
          return false;
        }

        var matches = responseText.match(/"Good","([^"]+)","([^"]+)","([^"]+)"\]/);
        if(matches) {
          $app.changeState(STATE.ORDER.newGoodSelected, {
            uuid: matches[3],
            name: matches[2],
          });
        }
      },

      'OrderService.stockForConsignmentsWithReserve': function(requestData, responseText){
        $log(requestData, responseText);
        var state = $app.getLastState();
        if(state.name !== STATE.ORDER.newGoodSelected) {
          return false;
        }

        $log('New position', state.data);
      },

    });

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
      $vm.selectedOrder = ko.observable(null);
      $vm.presentsCount = ko.observable(1);

      $vm.selectedOrderPositions = ko.observableArray([]);

      $goods = $('<div id="taist_allGoods" data-bind="if: selectedOrder() !== null">');

      var div,
          table  = $('<table>')
            .addClass('taist-table'),
          thead  = $('<thead>').appendTo(table),
          trhead = $('<tr>').appendTo(thead),
          tbody  = $('<tbody data-bind="foreach: selectedOrder().customerOrderPosition()">').appendTo(table),
          trbody = $('<tr>').appendTo(tbody);

      div = $('<div>')
        .attr('data-bind', 'if: selectedPlan() !== null')
        .appendTo($goods);
      $('<span>')
        .text('Базовая технологическая карта')
        .appendTo(div);
      $('<span>')
        .addClass('ml20 bold')
        .attr('data-bind', 'text: selectedPlan().name')
        .appendTo(div);

      div = $('<div>')
        .appendTo($goods);
      $('<span>')
        .text('Название заказа')
        .appendTo(div);
      $('<span>')
        .addClass('ml20 bold')
        .attr('data-bind', 'text: selectedOrder().name')
        .appendTo(div);

      div = $('<div>').appendTo($goods);
      $('<span>')
        .text('Количество подарков')
        .appendTo(div);
      $('<input>')
        .addClass('tar')
        .attr('data-bind', 'value: selectedOrder()._presentsCount')
        .css({ width: 40, marginLeft: 20})
        .appendTo(div);

      div = $('<div>').appendTo($goods);
      $('<span>')
        .text('Итого:')
        .appendTo(div);
      $('<span>')
        .addClass('ml20 bold fs125')
        .attr('data-bind', 'text: selectedOrder()._sTotal')
        .appendTo(div);

      div = $('<div>').appendTo($goods);
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

      table.appendTo($goods);
      $goods.appendTo($div);

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
