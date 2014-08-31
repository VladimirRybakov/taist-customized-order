function init(){var require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"atrspb":[function(require,module,exports){
module.exports=require('x7s1YF');
},{}],"x7s1YF":[function(require,module,exports){
var addonEntry = {
  start: function(_taistApi, entryPoint) {
    require('./start')(_taistApi);
  }
};

module.exports = addonEntry;

},{"./start":22}],3:[function(require,module,exports){
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
    $('<span class="w200">')
      .text('Базовая технологическая карта')
      .appendTo(div);
    $('<span>')
      .addClass('ml20 bold')
      .attr('data-bind', 'text: basePlan().name')
      .appendTo(div);

    div = $('<div>')
      .appendTo(container);
    $('<span class="w200">')
      .text('Название заказа')
      .appendTo(div);
    $('<span>')
      .addClass('ml20 bold')
      .attr('data-bind', 'text: selectedOrder()._name')
      .appendTo(div);

    div = $('<div>')
      .appendTo(container);
    $('<span class="w200">')
      .html('&nbsp;')
      .appendTo(div);
    $('<input>')
      .attr('data-bind', 'value: selectedOrder()._customName')
      .css({ width: 300, marginLeft: 20})
      .appendTo(div);

    div = $('<div>').appendTo(container);
    $('<span class="w200">')
      .text('Количество подарков')
      .appendTo(div);
    $('<input>')
      .addClass('tar')
      .attr('data-bind', 'value: selectedOrder()._presentsCount')
      .css({ width: 40, marginLeft: 20})
      .appendTo(div);

    div = $('<div>').appendTo(container);
    $('<span class="w200">')
      .text('Итого:')
      .appendTo(div);
    $('<span>')
      .addClass('ml20 bold fs125')
      .attr('data-bind', 'text: selectedOrder()._sTotal')
      .appendTo(div);

    div = $('<div>').appendTo(container);
    $('<span class="w200">')
      .text('НДС:')
      .appendTo(div);
    $('<span>')
      .addClass('ml20')
      .attr('data-bind', 'text: selectedOrder()._sVat')
      .appendTo(div);

    function modifyFieldAvailability(elem) {
      var div,
          container = elem.parent();

      container.css({position: 'relative'});

      hide = function() {
        console.log('HIDE');
        $('.availabilityInfo').hide();
        return false;
      }

      show = function(data, event) {
        console.log('SHOW');
        $('.availabilityInfo').hide();
        $('.availabilityInfo', $(event.target).parent()).show();
      }

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

    [
      { title: '', bind: 'checked', var: '_isSelected'},
      { title: 'Товар', bind: 'text', var: '_name' },
      { title: 'Тех. карта', bind: 'value', var: '_quantityPerPresent', cls: 'tar' },
      { title: 'Кол-во', bind: 'text', var: '_quantity', cls: 'tar' },
      { title: 'Доступно', bind: 'text', var: '_available', cls: 'tar', custom: modifyFieldAvailability },
      { title: 'Резерв', bind: 'text', var: 'reserve', cls: 'tar' },
      { title: 'Цена', bind: 'text', var: '_price', cls: 'tar' },
      // { title: 'Скидка, %', bind: 'text', var: 'discount', cls: 'tar' },
      { title: 'НДС, %', bind: 'text', var: 'vat', cls: 'tar' },
      { title: 'Сумма НДС', bind: 'text', var: '_sVat', cls: 'tar' },
      { title: 'Итого', bind: 'text', var: '_sTotal', cls: 'tar' },
      { title: '', bind: 'text', var: "'x'", cls: 'removePosition', click: '_onRemove'},
    ].map(function(item){
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
    })

    table.appendTo(container);
  }
}

},{}],4:[function(require,module,exports){
module.exports = {};

},{}],5:[function(require,module,exports){
var state = [];

module.exports = {
  changeState: function(name, data){
    state.push({
      name: name,
      data: data
    })
  },

  resetState: function(){
    state.splice(0,state.length);
  },

  getLastState: function(){
    return state[state.length - 1];
  },

  getFirstState: function(){
    return state[0];
  },
};

},{}],6:[function(require,module,exports){
module.exports=require(4)
},{}],7:[function(require,module,exports){
var goodsNode = null;

module.exports = {
  getGoodsNode: function(){
    return goodsNode;
  },
  setGoodsNode: function(node){
    goodsNode = node;
  }
};

},{}],8:[function(require,module,exports){
module.exports=require(4)
},{}],9:[function(require,module,exports){
module.exports = {
  onEditCustomerOrder: require('./handlers/onEditCustomerOrder'),
  onChangeHash: require('./handlers/onChangeHash'),
  onCustomerOrder: require('./handlers/onCustomerOrder'),
  onNewCustomerOrder: require('./handlers/onNewCustomerOrder'),
  onSaveOrder: require('./handlers/onSaveOrder'),
  onReserve: require('./handlers/onReserve'),
  onChangesDialog: require('./handlers/onChangesDialog'),
  onDelete: require('./handlers/onDelete'),
}

},{"./handlers/onChangeHash":10,"./handlers/onChangesDialog":11,"./handlers/onCustomerOrder":12,"./handlers/onDelete":13,"./handlers/onEditCustomerOrder":14,"./handlers/onNewCustomerOrder":15,"./handlers/onReserve":16,"./handlers/onSaveOrder":17}],10:[function(require,module,exports){
var $app = require('../globals/app'),
    $api = require('../globals/api'),
    STATE = require('../state');

module.exports = function() {
  var hash = location.hash,
      isCancelled = ($app.getLastState() || {}).name === 'orderClosingCanceled';

  if($app.getFirstState() && $('.b-lognex-dialog-box.b-message-box').size() > 0) {
    return require('../handlers').onChangesDialog()
  }

  $app.resetState();

  if(/#customerorder$/.test(hash)){
    $('#onCustomerOrder').show();
    return require('../handlers').onCustomerOrder();
  }
  else{
    $('#onCustomerOrder').hide();
  }

  if(/#customerorder\/edit/.test(hash)){

    $app.changeState(STATE.APP.orderOpened);
    $('body').addClass('newOrderInterface');
    if(isCancelled) {
      return false
    }
    else {
      return require('../handlers').onEditCustomerOrder();
    }
  }
  else{
    $('body').removeClass('newOrderInterface');
  }
}

},{"../globals/api":4,"../globals/app":5,"../handlers":9,"../state":23}],11:[function(require,module,exports){
var $api = require('../globals/api'),
    $app = require('../globals/app'),
    STATE = require('../state')

module.exports = function(){
  var buttons = $('.b-popup-button', '.b-lognex-dialog-box.b-message-box'),
      yesButton = $(buttons[0]),
      div;

  buttons.css({position: 'relative'});

  div = $("<div>")
    .css({
      position: 'absolute',
      top: -1,
      left: -1,
      overflow: 'hidden',
      width: yesButton.parent().width() + 2 - 10,
      height: yesButton.height() + 2,
    })
    .click(function(event){
        require("../handlers").onSaveOrder();
        return false;
    })
    .prependTo(yesButton);

  buttons.click(function(event){
    var target = event.target,
        action = $(target).text();

    $api.log('USER ACTION', action)

    switch(action){
      case 'Да':
        // Should be handled before
        break;

      case 'Нет':
        // Do nothing
        break;

      case 'Отмена':
        $app.changeState(STATE.APP.orderClosingCanceled);
        break;
    }
  });

  $('.b-close-button', '.b-lognex-dialog-box.b-message-box')
    .click(function(){
      $app.changeState(STATE.APP.orderClosingCanceled);
    });
}

},{"../globals/api":4,"../globals/app":5,"../handlers":9,"../state":23}],12:[function(require,module,exports){
module.exports = function() {
  var $log = require('../globals/api').log;

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
        .attr('colspan', 8)
        .css({ paddingRight: '10px'})
        .appendTo(tr);
      tr.appendTo(container);
    }

    $('#onCustomerOrder').show();
    $('#taist_processingPlans').appendTo(td);
  });

}

},{"../globals/api":4}],13:[function(require,module,exports){
module.exports = function() {
  var positions = $vm.selectedOrder().customerOrderPosition;
  positions.remove(function(pos) {
    return pos._isSelected();
  });
  require('../handlers').onSaveOrder();
}

},{"../handlers":9}],14:[function(require,module,exports){
var $api = require('../globals/api'),
    $client = require('../globals/client'),
    $dom = require('../globals/dom'),
    $app = require('../globals/app'),
    STATE = require('../state');

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

module.exports = function() {
  var i, l, order, positions,
      uuid = location.hash.match(/id=(.+)/)[1],
      $log = $api.log;

  $log('onEditCustomerOrder', uuid);

  var goodsDOMNode = $dom.getGoodsNode();
  ko.cleanNode(goodsDOMNode);
  $(goodsDOMNode).hide();
  $('tbody tr', goodsDOMNode).not(':first').remove();

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
          create: require('../processors').createSumObject
        },
        customerOrderPosition: {
          create: require('../processors').createCustomerOrderPosition
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

      order._presentsCount = ko.observable(taistOrderData.presentsCount || 1);
      order._template = ko.observable(taistOrderData.orderTemplate || '');
      order._customName = ko.observable(taistOrderData.customName || '');

      $vm.selectedOrder(order);

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
        var name = ($vm.selectedOrder()._customName() !== ''
            ? $vm.selectedOrder()._customName()
            : $vm.basePlan().name)
          + ' - ' + this._customer()
          + ' - ' + this._presentsCount() + 'шт.';
        return name;
      }, order);

      parseOrderData(order);

      function redefineButtons(parent, id){
        var btn, div = $('#' + id);

        if(div.size() === 0) {
          btn = $('.b-popup-button-green', parent).parent(),
          div = $('<div>')
          .attr('id', id)
          .css({
            width: btn.width() - 10,
            height: btn.height() - 3,
          })
          .addClass('taist-onSaveOrder')
          .click(function(event){
            require('../handlers').onSaveOrder();
          })
          .appendTo(btn);

          btn.css({position: 'relative'});

          btn = $('.b-popup-button-gray:visible:first', parent);
          btn.click(function(){
            $log('ON CHANGE DIALOG');
            require('../handlers').onChangesDialog();
          });
        }
      }

      // $api.wait.elementRender('.b-fixed-panel.b-fixed-panel-up.b-fixed-panel-up-last', function(elem){
      //   $log('PANEL')
      //   redefineButtons(elem, 'onSaveOrderPanel');
      // });

      $api.wait.elementRender('.all-goods-table', function(){
        $log('applyBindings for customerOrder');


        var originalGoodsTable = $('.all-goods-table');

        var btn,
            div = $('#onSaveOrder');

        if(div.size() === 0) {

          redefineButtons('.b-editor-toolbar', 'onSaveOrder');

          var buttons = $('[role=button]', '.all-goods-table-buttons'),
              hiddenButtons = [
                'по штрихкоду',
                'из остатков',
              ];

          for(i = 0, l = buttons.size(); i < l; i += 1) {
            btn = $(buttons[i]);
            if(hiddenButtons.indexOf(btn.text()) > -1) {
              btn.css({
                width: btn.width(),
                border: 'none'
              });
              btn.children().hide();
            }
          }

          buttons
            .removeClass('b-popup-button-disabled')
            .click(function(event){
              var buttonName = $(event.target).text(),
                  selector,
                  element;

              $log(buttonName);
              switch(buttonName){
                case 'Добавить позицию':
                  $app.changeState(STATE.ORDER.newGoodWaited);
                  break;
                case 'Зарезервировать':
                  require('../handlers').onReserve(true);
                  break;
                case 'Очистить резерв':
                  require('../handlers').onReserve(false);
                  break;
                case 'Удалить':
                  require('../handlers').onDelete();
                  break;
              }
          });
        }

        ko.applyBindings($vm, goodsDOMNode);
        $(goodsDOMNode)
          .appendTo( originalGoodsTable.parent() )
          .show();
      });

    });
  });
}

},{"../globals/api":4,"../globals/app":5,"../globals/client":6,"../globals/dom":7,"../handlers":9,"../processors":18,"../state":23}],15:[function(require,module,exports){
var $vm     = require('../globals/vm'),
    $api    = require('../globals/api'),
    $client = require('../globals/client');

module.exports = function() {
  $log = $api.log;
  $log('onNewCustomerOrder', $vm.basePlan());
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
            // name: new Date().getTime().toString(),
            customerOrderPosition: positions
          }

          $client.save("moysklad.customerOrder", order, function(dummy, order){
            $api.companyData.set(order.uuid, {
              uuid: order.uuid,
              name: '',
              customName: '',
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

},{"../globals/api":4,"../globals/client":6,"../globals/vm":8}],16:[function(require,module,exports){
var $vm = require('../globals/vm');

module.exports = function(doesUserWantToReserve){
  var positions = $vm.selectedOrder().customerOrderPosition();
  if($vm.selectedPositions().length > 0) {
    positions = $vm.selectedPositions();
  }

  ko.utils.arrayForEach(positions, function(item) {
    item.reserve(doesUserWantToReserve ? item._quantity() : 0);
  });

  require('../handlers').onSaveOrder();

  ko.utils.arrayForEach($vm.selectedPositions(), function(pos){
    pos._isSelected(false);
  })
}

},{"../globals/vm":8,"../handlers":9}],17:[function(require,module,exports){
var $api = require('../globals/api'),
    $client = require('../globals/client');

module.exports = function() {
  var $log = $api.log;
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
            name: $vm.selectedOrder()._name(),
            customName: $vm.selectedOrder()._customName(),
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

  if($vm.selectedOrder()._customer() == '') {
    alert('Выберите контрагента перед сохранением заказа');
    return false;
  }

  plan = $.extend(true, {}, $vm.selectedPlan().data);
  plan.name = $vm.selectedOrder()._name();
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
        require('../utils').parseProcessingPlans([plan]);
      });

      saveOrder(plan.uuid);
    });
  } else {
      plan.material = prepareMaterials(plan)
      $client.save("moysklad.processingPlan", plan, function(error, plan){
        $log('Plan updated', plan);
        require('../utils').parseProcessingPlans([plan]);
      });
      saveOrder(plan.uuid);
  }
};

},{"../globals/api":4,"../globals/client":6,"../utils":25}],18:[function(require,module,exports){
module.exports = {
  createCustomerOrderPosition: require('./processors/createCustomerOrderPosition'),
  createSumObject: require('./processors/createSumObject'),
}

},{"./processors/createCustomerOrderPosition":19,"./processors/createSumObject":20}],19:[function(require,module,exports){
var $api = require('../globals/api'),
    $client = require('../globals/client'),
    $dom = require('../globals/dom'),
    $app = require('../globals/app'),
    STATE = require('../state'),

    $queue = require('../requestQueue');

module.exports = function (options) {
  if(!options.data.vat) {
    options.data.vat = 18;
  }

  var $log = $api.log,
      koData = ko.mapping.fromJS(options.data, {
      basePrice: require('../processors').createSumObject,
      price: require('../processors').createSumObject,
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
  }

  koData._available = ko.observable('');
  koData._availableInfo = ko.observable('');
  koData._isSelected = ko.observable(false);

  $queue.push({
    req: function(callback){
      $client.stock({
        goodUuid: goodUuid
      }, function(){
        callback.apply(null, arguments);
      });
    },
    res: function(dummy, data){
      koData._available(
        data[0].quantity
      );

      koData._availableInfo(
          'Доступно: ' + data[0].quantity + '<br>'
        + 'Остаток: ' + data[0].stock + '<br>'
        + 'Резерв: ' + data[0].reserve + '<br>'
        + 'Ожидание: ' + data[0].inTransit
      );
    }
  });

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

},{"../globals/api":4,"../globals/app":5,"../globals/client":6,"../globals/dom":7,"../processors":18,"../requestQueue":21,"../state":23}],20:[function(require,module,exports){
module.exports = function (options) {
  return ko.mapping.fromJS(
    options.data,
    {
      copy: ['TYPE_NAME']
    }
  );
}

},{}],21:[function(require,module,exports){
var $api = require('./globals/api'),
    queue = [],
    isInProgress = false;

function process(){
  var l = queue.length,
      request,
      $log = $api.log;

  isInProgress = true;

  if(l > 0) {
    request = queue.shift();
    request.req(function(){
      request.res.apply(null, arguments);
      setTimeout(process, 42 * 3);
    });
  } else {
    isInProgress = false;
  }
}

module.exports = {
  push: function(request){
    queue.push(request);
    if(isInProgress === false) {
      process();
    }
  }
}

},{"./globals/api":4}],22:[function(require,module,exports){
var $api = require('./globals/api')
  , $log
  , $client = require('./globals/client')
  , $vm = require('./globals/vm')
  , $div
  , $dom = require('./globals/dom')
  , sctipt
  , handlers = require('./handlers')
  , $app = require('./globals/app')

  , STATE = require('./state')
  ;

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

function onStart(_taistApi) {

  $.extend($api, _taistApi);
  window.$api = $api;

  $log = $api.log;
  $log('onStart');

  waitForKnockout(20, function(){
    $.extend($client, window.require('moysklad-client').createClient());

    var xmlhttphandlers = require("./xmlhttphandlers");
    require("./xmlhttpproxy").registerHandlers( xmlhttphandlers );

    $vm.companyUuid = $client.from('MyCompany').load()[0].uuid;

    $api.companyData.setCompanyKey($vm.companyUuid);

    $api.companyData.get('taistOptions', function(error, taistOptions){

      taistOptions || (taistOptions = {});

      if(taistOptions.moyskladClientUser && taistOptions.moyskladClientUser.length > 0
      && taistOptions.moyskladClientPass && taistOptions.moyskladClientPass.length > 0) {
        $client.setAuth(taistOptions.moyskladClientUser, taistOptions.moyskladClientPass);
      }

      $div = $('<div id="taist">')
        .css({display: 'none'})
        .prependTo('body');

      var div = $('<div id = "taist_processingPlans">');
      $("<select>")
        .attr('data-bind', "options: baseProcessingPlans, optionsText: 'name', value: basePlan")
        .css({ width: 400 })
        .appendTo(div);

      $("<button>")
        .text('Заказ по шаблону')
        .css({marginLeft: 20})
        .click(require('./handlers').onNewCustomerOrder)
        .appendTo(div);

      div.appendTo($div);

      $vm.processingPlans = ko.observableArray([]);

      $vm.selectedPlan = ko.observable(null);
      $vm.basePlan = ko.observable(null);

      var processingPlans = $client.from('ProcessingPlan').load();
      require('./utils').parseProcessingPlans(processingPlans);

      $vm.baseProcessingPlans = ko.computed(function(){
        return ko.utils.arrayFilter($vm.processingPlans(), function(plan) {
          return plan.data.parentUuid === taistOptions.basePlanFolder;
        });
      }).extend({ throttle: 1 });

      var settingsDiv = require('./taistSettingsInterface').create(taistOptions);
      // ko.applyBindings($vm, settingsDiv[0]);
      settingsDiv.appendTo($div);
      ko.applyBindings($vm, $div[0]);

      var td = $('<td align="left" style="vertical-align: top; padding-left: 20px;">');

      settingsDiv.appendTo(td);

      $('<img src="http://www.tai.st/images/logo_sq_180.png">')
        .css({
          width: 24,
          cursor: 'pointer',
        })
        .click(function(){
          $(settingsDiv).toggle();
        })
        .appendTo(td);

      setTimeout(function(){
        var container = $('.b-main-panel .info tr');
        td.appendTo(container);
      }, 2000);

      $vm.goods = {}
      $vm.customerOrders = {};
      $vm.selectedOrder  = ko.observable(null);
      $vm.presentsCount  = ko.observable(1);

      $vm.selectedPositions = ko.computed(function(){
        var order = $vm.selectedOrder();

        if(order === null) {
          return [];
        }

        return ko.utils.arrayFilter(order.customerOrderPosition(), function(pos) {
          return pos._isSelected();
        })

      }).extend({ rateLimit: 50 });

      $vm.selectedOrderPositions = ko.observableArray([]);

      var goodsDOMNode = $('<div id="taist_allGoods" data-bind="if: selectedOrder() !== null">');
      require('./customerOrderInterface').create(goodsDOMNode);
      goodsDOMNode.appendTo($div);
      $dom.setGoodsNode(goodsDOMNode[0]);

      $api.hash.onChange(handlers.onChangeHash);
      handlers.onChangeHash(location.hash);
    });
  });
}

module.exports = onStart

},{"./customerOrderInterface":3,"./globals/api":4,"./globals/app":5,"./globals/client":6,"./globals/dom":7,"./globals/vm":8,"./handlers":9,"./state":23,"./taistSettingsInterface":24,"./utils":25,"./xmlhttphandlers":26,"./xmlhttpproxy":27}],23:[function(require,module,exports){
module.exports = {
  APP: {
    appStarted:           'appStarted',
    orderOpened:          'orderOpened',
    orderClosingCanceled: 'orderClosingCanceled',
  },
  ORDER: {
    newGoodWaited:   'newGoodWaited',
    newGoodSelected: 'newGoodSelected',
    newGoodAdded:    'newGoodAdded',
  },
}

},{}],24:[function(require,module,exports){
var $api = require('./globals/api');
var $client = require('./globals/client');

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
      $api.companyData.set('taistOptions', {
        basePlanFolder:     ($vm.basePlanFolder()     || {}).uuid,
        orderPlanFolder:    ($vm.orderPlanFolder()    || {}).uuid,
        selectedWarehouse:  ($vm.selectedWarehouse()  || {}).uuid,
        selectedCompany:    ($vm.selectedCompany()    || {}).uuid,

        moyskladClientUser: $vm.moyskladClientUser(),
        moyskladClientPass: $vm.moyskladClientPass(),
      }, function(){});
    }

    // var container = $('.b-main-panel .info tr'),
    //     td = $('<td align="left" style="vertical-align: top; padding-left: 20px;">')
    //       .appendTo(container),
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

    $vm.moyskladClientUser = ko.observable(taistOptions.moyskladClientUser || '');
    $('<div>')
      .text('Имя пользователя')
      .appendTo(div);
    $('<input>')
      .attr('data-bind', 'value: moyskladClientUser')
      .css({ width: 400 })
      .appendTo(div);

    $vm.moyskladClientPass = ko.observable(taistOptions.moyskladClientPass || '');
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

},{"./globals/api":4,"./globals/client":6}],25:[function(require,module,exports){
var $vm = require('./globals/vm');

module.exports = {
  parseProcessingPlans: function(plans) {
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
}

},{"./globals/vm":8}],26:[function(require,module,exports){
var $app    = require('./globals/app'),
    $api    = require('./globals/api'),
    $client = require('./globals/client'),
    STATE   = require('./state');

module.exports = {
  'CommonService.getItemTO': function(requestData, responseText){
    $api.log('CommonService.getItemTO', requestData, responseText);
    var state = $app.getLastState();
    if(!state
      ||
        state.name !== STATE.ORDER.newGoodWaited
        && state.name !== STATE.ORDER.newGoodSelected )
    {
      return false;
    }
    // "Good","lb__fRJLif2eCLCrJe-xb1","Свечка \"Шишка\"","630da863-02d6-11e4-3af0-002590a28eca"

    var matches = responseText.match(/"Good","([^"]+)","(([^"]|\\\")+?)","([^"]+)"\]/);
    if(matches) {
      $api.log('MATCHED GOOD', matches);
      $app.changeState(STATE.ORDER.newGoodSelected, {
        uuid: matches[4],
        name: matches[2],
      });
    }
  },

  'ConsignmentService.getGoodConsignmentList': function(requestData, responseText){

  },

  'OrderService.stockForConsignmentsWithReserve': function(requestData, responseText){
    $api.log(requestData, responseText);
    var state = $app.getLastState();
    if(!state || state.name !== STATE.ORDER.newGoodSelected) {
      return false;
    }

    $api.log('New position', state.data);
    $client.load('Good', state.data.uuid, function(dummy, good){

      if(!$vm.goods[good.uuid]) {
        $vm.goods[good.uuid] = {
          name: ko.observable(good.name)
        };
      }

      var position = require('./processors').createCustomerOrderPosition({
        data: {
          vat: 18,
          goodUuid: good.uuid,
          quantity: 1,
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
        }
      });

      var order = $vm.selectedOrder();
      position._quantity = ko.computed(function(){
        var quantity = this._quantityPerPresent() * order._presentsCount();
        this.quantity(quantity);
        return quantity;
      }, position);

      $api.log(position);
      order.customerOrderPosition.push(position);
    });
  },

  'TagService.getTags': function(requestData, responseText){
    $api.log(requestData, responseText);
  },

  'ContractService.getContracts': function(requestData, responseText){
    $api.log(requestData, responseText);
    var state = $app.getFirstState();
    if(!state || state.name !== STATE.APP.orderOpened) {
      return false;
    }

    var pattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/,
        matches = requestData.match(pattern);
    if(matches) {
      $client.load('Company', matches[0], function(dummy, company){
        if(company) {
          var order = $vm.selectedOrder();
          if(order) {
            order.sourceAccountUuid = company.accountUuid;
            order.sourceAgentUuid   = company.uuid;
            order._customer(company.name);
            $api.log(company);
          }
        }
      });
    }
  },
}

},{"./globals/api":4,"./globals/app":5,"./globals/client":6,"./processors":18,"./state":23}],27:[function(require,module,exports){
var $api = require("./globals/api");

var registerXMLHttpHandlers = function (handlers) {
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
            if(method !== 'ping' && method !== 'pull') {
              handlerName = service + '.' + method;
              if(handlers && typeof handlers[handlerName] === 'function') {
                handlers[handlerName](args, self.responseText);
              }
              else {
                $api.log('REQUEST', service, method, self.responseText);
              }
            }
          }
        }
      }
      onReady && onReady.apply(self, arguments);
    }

    XMLHttpRequestSend.apply(this, arguments);
  }
};

module.exports = {
  registerHandlers: registerXMLHttpHandlers
};

},{"./globals/api":4}]},{},["x7s1YF"]);return require("atrspb")};