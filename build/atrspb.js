function init(){var require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"U+ghpQ":[function(require,module,exports){
var addonEntry = {
  start: function(_taistApi, entryPoint) {
    require('./start')(_taistApi);
  }
};

module.exports = addonEntry;

},{"./start":32}],"atrspb":[function(require,module,exports){
module.exports=require('U+ghpQ');
},{}],3:[function(require,module,exports){
module.exports = {
  create: function(container){
    var div,
        table  = $('<table>').addClass('taist-table');

    div = $('<div>')
      .css({
        position: 'absolute',
        left: 600,
      })
      .text('Расчет себестоимости')
      .appendTo(container);

    require('./primeCostInterface').create(div);

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

      {
        name: 'Процент', cls: 'tar', elem: 'input',
        bind: 'value: selectedOrder().primeCostInterest',
        css: { width: 60, marginLeft: 20}
      },
      {
        name: 'Налог', cls: 'tar', elem: 'input',
        bind: 'value: selectedOrder().primeCostTax',
        css: { width: 60, marginLeft: 20}
      },
      {
        name: 'Выдача', cls: 'tar', elem: 'input',
        bind: 'value: selectedOrder().primeCostOutput',
        css: { width: 60, marginLeft: 20}
      },
      {
        name: 'Транспортная упаковка', cls: 'tar', elem: 'input',
        bind: 'value: selectedOrder().primeCostPackage',
        css: { width: 60, marginLeft: 20}
      },
      {
        name: 'Риски (% от суммы)', cls: 'tar', elem: 'input',
        bind: 'value: selectedOrder().primeCostRisk',
        css: { width: 60, marginLeft: 20}
      },

      // { name: '', cls: '', bind: '' },
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

    var orderPositionsField = [
      { title: '', bind: 'text', var: '"::::"', cls: 'handle'},
      { title: '', bind: 'checked', var: '_isSelected'},
      { title: 'Товар', bind: 'text', var: '_name' },
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

},{"./primeCostInterface":24,"./utils":35}],4:[function(require,module,exports){
module.exports = {
  getProcessingPlanGoods: require('./dataProvider/getProcessingPlanGoods'),
}

},{"./dataProvider/getProcessingPlanGoods":5}],5:[function(require,module,exports){
var $client = require('../globals/client');

module.exports = function(uuid){
  var plan,
      lazyLoader,
      i, l,
      goods = [];

  plan = $client.from('ProcessingPlan').select({ uuid: uuid }).load()[0];
  if(plan) {
    lazyLoader = $client.createLazyLoader();
    lazyLoader.attach(plan, ['material.good']);
    for(i = 0, l = plan.material.length; i < l; i += 1) {
      goods.push(plan.material[i].good);
    }
  }
  return goods;
}

},{"../globals/client":9}],6:[function(require,module,exports){
var $vm = require('./globals/vm'),
    $api = require('./globals/api'),

    updateFunctions = {},

    getDictionary = function (dict, name, forceUpdate) {
      $vm[dict] = require('./utils')
      .getFromLocalStorage('dict.' + dict, updateFunctions[dict] || function() {
        console.log('dictsProvider didn\'t find update function for ' + dict);
        return {}
      }, forceUpdate)
    }

module.exports = {
  get: function(dict, name) {

    if(!$vm[dict]){
      getDictionary(dict, name, false);
    }

    if(!$vm[dict][name]){
      getDictionary(dict, name, true);
    }

    console.log('getFromDict', dict, name, $vm[dict][name])
    return $vm[dict][name]
  },

  register: function(dict, updateFunc) {
    updateFunctions[dict] = updateFunc
  }
}

},{"./globals/api":7,"./globals/vm":11,"./utils":35}],7:[function(require,module,exports){
module.exports = {};

},{}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
module.exports=require(7)
},{}],10:[function(require,module,exports){
var goodsNode = null;

module.exports = {
  getGoodsNode: function(){
    return goodsNode;
  },
  setGoodsNode: function(node){
    goodsNode = node;
  }
};

},{}],11:[function(require,module,exports){
module.exports=require(7)
},{}],12:[function(require,module,exports){
module.exports = {
  onEditCustomerOrder: require('./handlers/onEditCustomerOrder'),
  onChangeHash: require('./handlers/onChangeHash'),
  onCustomerOrder: require('./handlers/onCustomerOrder'),
  onNewCustomerOrder: require('./handlers/onNewCustomerOrder'),
  onSaveOrder: require('./handlers/onSaveOrder'),
  onReserve: require('./handlers/onReserve'),
  onChangesDialog: require('./handlers/onChangesDialog'),
  onDelete: require('./handlers/onDelete'),
  onSelectBasePlanForCustomerOrder: require('./handlers/onSelectBasePlanForCustomerOrder'),
  onEditProcessingPlan: require('./handlers/onEditProcessingPlan'),
  onCreateGoodsForOrder: require('./handlers/onCreateGoodsForOrder'),
}

},{"./handlers/onChangeHash":13,"./handlers/onChangesDialog":14,"./handlers/onCreateGoodsForOrder":15,"./handlers/onCustomerOrder":16,"./handlers/onDelete":17,"./handlers/onEditCustomerOrder":18,"./handlers/onEditProcessingPlan":19,"./handlers/onNewCustomerOrder":20,"./handlers/onReserve":21,"./handlers/onSaveOrder":22,"./handlers/onSelectBasePlanForCustomerOrder":23}],13:[function(require,module,exports){
var $app = require('../globals/app'),
    $api = require('../globals/api'),
    STATE = require('../state');

module.exports = function() {
  var hash = location.hash,
      isCancelled = ($app.getLastState() || {}).name === 'orderClosingCanceled';

  if($app.getFirstState() && $('.b-lognex-dialog-box.b-message-box').size() > 0) {
    return require('../handlers').onChangesDialog()
  }

  $('#taist_basePlanForOrder').hide();

  $app.resetState();

  if(/#customerorder(\?global_[a-zA-Z]+Filter.+)?$/.test(hash)) {
    $('#onCustomerOrder').show();
    return require('../handlers').onCustomerOrder();
  }
  else {
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
  else {
    $('body').removeClass('newOrderInterface');
  }

  if(/#processingplan\/edit/.test(hash)) {
    return require('../handlers').onEditProcessingPlan();
  }
}

},{"../globals/api":7,"../globals/app":8,"../handlers":12,"../state":33}],14:[function(require,module,exports){
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

},{"../globals/api":7,"../globals/app":8,"../handlers":12,"../state":33}],15:[function(require,module,exports){
var $vm = require('../globals/vm'),
    $api = require('../globals/api'),
    $client = require('../globals/client');

module.exports = function(){
  var positions = $vm.selectedPositions(),
      length = positions.length,
      updatedPositions = [],
      ts = new Date().getTime();

  function updateGoodName(name) {
    var suffix = ts,
        order = $vm.selectedOrder();

    if(order) {
      if(order._project()) {
        suffix = order._project();
      }
    }

    name = name.replace(/\s*\(.+?\)\s*$/, '');
    name += ' (' + suffix + ')';
    return name;
  }

  ko.utils.arrayForEach(positions, function(pos) {
    var good = $api.moysklad.cloneGood(pos.goodUuid(), updateGoodName);

    $client.save('moysklad.good', good, function(dummy, good){
      delete(pos.consignmentUuid);
      pos.goodUuid(good.uuid);

      updatedPositions.push(good);
      if(updatedPositions.length === length){
        console.log(updatedPositions);

        require('../handlers').onSaveOrder();

        ko.utils.arrayForEach($vm.selectedPositions(), function(pos){
          pos._isSelected(false);
        })
      }
    });
  });
}

$api.onCreateGoodsForOrder = module.exports;

},{"../globals/api":7,"../globals/client":9,"../globals/vm":11,"../handlers":12}],16:[function(require,module,exports){
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

},{"../globals/api":7}],17:[function(require,module,exports){
module.exports = function() {
  var positions = $vm.selectedOrder().customerOrderPosition;
  positions.remove(function(pos) {
    return pos._isSelected();
  });
  require('../handlers').onSaveOrder();
}

},{"../handlers":12}],18:[function(require,module,exports){
var $api = require('../globals/api'),
    $client = require('../globals/client'),
    $dom = require('../globals/dom'),
    $app = require('../globals/app'),
    STATE = require('../state');

module.exports = function() {
  var i, l, order, positions,
      matches = location.hash.match(/id=(.+)/),
      uuid,
      $log = $api.log;

  var goodsDOMNode = $dom.getGoodsNode();
  ko.cleanNode(goodsDOMNode);
  $(goodsDOMNode).hide();
  $('.taist-table tbody tr', goodsDOMNode).not(':first').remove();
  $('.primeCost tbody tr', goodsDOMNode).not(':first').remove();

  require('../utils').waitForElement('.tutorial-step-inline-editor', function() {
    $api.log('SHOW SELECTOR');
    $('#taist_basePlanForOrder').insertBefore('.tutorial-step-inline-editor').show();
  });

  if(matches === null) {
    $('body').removeClass('newOrderInterface');
    return;
  }

  uuid = matches[1];
  $log('onEditCustomerOrder', uuid);

  $api.getOrder(uuid, function(error, taistOrderData) {

    console.log('getOrder callback', error, taistOrderData)

    if(typeof taistOrderData === 'undefined') {
      $('body').removeClass('newOrderInterface');
      return;
    }

    require('../utils').waitForElement('.tutorial-step-inline-editor', function() {
      $api.log('HIDE SELECTOR');
      $('#taist_basePlanForOrder').hide();
    });

    var processingPlans = $client.from('ProcessingPlan')
      .select( { uuid: (taistOrderData.orderTemplate || taistOrderData.baseTemplate) } )
      .load();

    require('../utils').parseProcessingPlans(processingPlans);

    var base;
    base = ko.utils.arrayFirst($vm.baseProcessingPlans(), function(plan) {
      return plan.uuid == taistOrderData.baseTemplate;
    });

    // $api.log(base);

    $vm.basePlan(base);

    var selected = ko.utils.arrayFirst($vm.processingPlans(), function(plan) {
      return plan.uuid == (taistOrderData.orderTemplate || taistOrderData.baseTemplate);
    })

    if(selected == null) {
      //Reset order template because it is not found
      taistOrderData.orderTemplate = '';
    }

    $vm.selectedPlan(selected || $vm.basePlan());

    $client.load('CustomerOrder', uuid, function(dummy, orderData){

      var good;

      order = $.extend({
        description: '',
      }, orderData);

      var lazyLoader = $client.createLazyLoader();
      lazyLoader.attach(order, ['customerOrderPosition.good']);
      for(i = 0, l = order.customerOrderPosition.length; i < l; i += 1) {
        good = order.customerOrderPosition[i].good;
        if(!$vm.goods[good.uuid]) {
          $vm.goods[good.uuid] = {
            name: ko.observable( good.name ),
            unit: ko.observable( require('../dictsProvider').get('units', good.uomUuid) )
          };
        }
      }

      $vm.customerOrders[uuid] = ko.mapping.fromJS(order, {
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
          'attribute',
          'changeMode',
          'created',
          'createdBy',
          '//customerOrderPosition[]',
          '//description',
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
      order._discount = ko.observable(taistOrderData.discount || 0);
      order._template = ko.observable(taistOrderData.orderTemplate || '');
      order._customName = ko.observable(taistOrderData.customName || '');
      order._project = ko.observable('');

      $vm.primeCostDiscount(order._discount());

      [ 'Interest', 'Tax', 'Output', 'Package', 'Risk'].forEach(function(param){
          param = 'primeCost' + param;
          order[param] = ko.observable( taistOrderData[param] || $vm[param]() )
      });

      $vm.presentsCount(order._presentsCount());
      order._presentsCount.subscribe(function(){
        $vm.presentsCount(order._presentsCount());
      });

      positions = order.customerOrderPosition();
      positions.sort(function(a, b) {
        function getIndex(o) {
          return (taistOrderData.sortOrder || []).indexOf(o.uuid)
        };
        return getIndex(a) <= getIndex(b) ? -1 : 1;
      });

      $api.log('POSITIONS', positions.length);
      for(i = 0, l = positions.length; i < l; i +=1){
        positions[i]._quantity = ko.computed(function(){
          var quantity = this._quantityPerPresent() * order._presentsCount();
          quantity = Math.round(quantity * 1000000)/1000000;
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

      order._pricePerPresent = ko.computed(function(){
        return this._total() / this._presentsCount();
      }, order);

      order._sTotal = ko.computed(function(){
        return this._total().toFixed(2).replace('.', ',');
      }, order);

      order._sTotalWithPackageAndRisks = ko.computed(function(){
        return ( (this._total() + parseFloat(this.primeCostPackage()) ) *
          ( 1 + parseFloat(this.primeCostRisk()) / 100)
        ).toFixed(2).replace('.', ',');
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

      $vm.selectedOrder(order);

      order._name = ko.computed(function(){
        var name = ($vm.selectedOrder()._customName() !== ''
            ? $vm.selectedOrder()._customName()
            : $vm.basePlan().name)
          + ' - ' + this._project()
          + ' - ' + this._presentsCount() + 'шт.';
        return name;
      }, order);

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

      /* Hotfix for order reloading */
      // setTimeout(function() {
        var selector = '.tutorial-step-inline-editor'
        $api.wait.elementRender(selector, function(){
          if(!/#customerorder\/edit/.test(location.hash)){
            $log('avoid to re:applyBindings');
            return;
          }

          $log('applyBindings for customerOrder');

          var originalGoodsTable = $(selector);

          var btn,
              div = $('#onSaveOrder');

          if(div.size() === 0) {

            redefineButtons('.b-editor-toolbar', 'onSaveOrder');

            $('.all-goods-table-buttons').show();
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

          $api.log('APPLY BINDINGS');
          $('.operationNamePanel td:last').hide();

          ko.applyBindings($vm, goodsDOMNode);
          require('../processors/parseOrderAttributes')($vm.selectedOrder());
          $(goodsDOMNode)
            .insertAfter( originalGoodsTable )
            .show();
        });

        $('.taist-table', goodsDOMNode).sortable({
          containerSelector: 'table',
          itemPath: '> tbody',
          itemSelector: 'tr',
          placeholder: '<tr class="placeholder">',
          handle: 'td.handle',
        });

      // }, 100);

    });
  });
}

},{"../dictsProvider":6,"../globals/api":7,"../globals/app":8,"../globals/client":9,"../globals/dom":10,"../handlers":12,"../processors":25,"../processors/parseOrderAttributes":30,"../state":33,"../utils":35}],19:[function(require,module,exports){
var $api = require('../globals/api');

module.exports = function() {
  $api.log('onEditProcessingPlan');
  $api.getOrdersList(function(error, data){
    $api.log('onLoadOrderList');
    var uuid = location.hash.match(/id=(.+)/)[1],
        orders = [],
        i, plan,
        divClass = 'processingplan-related-orders',
        div;

    div = $('<div>').addClass(divClass);

    for(i in data) {
      plan = data[i];
      if(plan.baseTemplate === uuid || plan.orderTemplate === uuid) {
        if(plan.name !== '') {
          $('<a>')
            .css({display: 'block', padding: 5, marginLeft: 20})
            .text(plan.name)
            .attr('href', 'https://online.moysklad.ru/app/#customerorder/edit?id=' + plan.uuid)
            .appendTo(div);

          orders.push(data[i]);
        }
      }
    }

    require('../utils').waitForElement('.processingplan-editor-items-editor:first',
      function(){
        $('.' + divClass).remove();
        div.insertAfter('.processingplan-editor-items-editor:first');
      }
    );

    console.log(orders);
  })
}

},{"../globals/api":7,"../utils":35}],20:[function(require,module,exports){
var $vm     = require('../globals/vm'),
    $api    = require('../globals/api'),
    $client = require('../globals/client');

module.exports = function() {
  $api.log('onNewCustomerOrder', $vm.selectedBasePlan());

  var i, l,
      uuid,
      goods,
      positions;

  var ts = new Date().getTime()

  goods = require('../dataProvider').getProcessingPlanGoods( $vm.selectedBasePlan().uuid );
  $api.log(goods);

  positions = require('../processors').createPositionsByGoods( goods, $vm.selectedBasePlan().materials );
  $api.log(positions);

  var order = {
    vatIncluded: true,
    applicable: true,
    sourceStoreUuid: $vm.selectedWarehouse().uuid,
    payerVat: true,
    // sourceAgentUuid: "", // контрагент
    targetAgentUuid: $vm.selectedCompany().uuid, // моя компания
    moment: new Date(),
    customerOrderPosition: positions,
    employeeUuid: $vm.employeeUuid,
  }

  $client.save("moysklad.customerOrder", order, function(dummy, order){
    $api.setOrder(order.uuid, {
      uuid: order.uuid,
      name: '',
      customName: '',
      baseTemplate: $vm.selectedBasePlan().data.uuid,
      orderTemplate: '',
      presentsCount: 10,
    }, function(error){
      location.hash = '#customerorder/edit?id=' + order.uuid;
    })
  });
}

},{"../dataProvider":4,"../globals/api":7,"../globals/client":9,"../globals/vm":11,"../processors":25}],21:[function(require,module,exports){
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

},{"../globals/vm":11,"../handlers":12}],22:[function(require,module,exports){
var $api = require('../globals/api'),
    $client = require('../globals/client'),
    $vm = require('../globals/vm');

module.exports = function() {
  var $log = $api.log;
  $log('onSaveOrder');

  var i, l,
      plan,
      m,
      materials = [],
      products = [],
      templateUuid = $vm.selectedOrder()._template(),
      saveOrder = function(templateUuid){
        var order = ko.mapping.toJS($vm.selectedOrder),
            mapping = {
              //'_company',
              '_customer' : { collection: 'Company', saveAs: 'sourceAgentUuid' },
              '_employee' : { collection: 'Employee', saveAs: 'employeeUuid' },
              //'_store',
              '_contract' : { collection: 'Contract', saveAs: 'contractUuid' },
              //'_date',
              '_project'  : { collection: 'Project', saveAs: 'projectUuid' },
            },
            key,
            mapObject,
            val,
            uuid;

        for(key in mapping) {
          val = $vm.selectedOrder()[key]();
          if(key == '_project' || key == '_contract'){
            val = val.replace(/\s+\[.+?\]/, '');
          }
          mapObject = mapping[key];

          if(val !== '') {
            uuid = require('../dictsProvider').get(mapObject.collection, val);
            if(uuid) {
              order[mapObject.saveAs] = uuid;
              $api.log('getAttrUuid', key, val, mapObject.saveAs, uuid);
              continue;
            }
          }

          delete(order[mapObject.saveAs])
        }

        var attrs = $vm.orderAttributes,
            attrValue;
            order.attribute = [];
        for(i = 0, l = attrs.length; i < l; i += 1) {
          uuid = attrs[i].uuid;
          $api.log('CustomAttribute', uuid, attrValue);
          attrValue = $vm.selectedOrder()['$' + uuid]();

          switch(attrs[i].attrType){
            case 'TEXT':
              order.attribute.push({
                TYPE_NAME: "moysklad.operationAttributeValue",
                metadataUuid: uuid,
                valueText: attrValue,
              });
              break;

            case 'STRING':
              order.attribute.push({
                TYPE_NAME: "moysklad.operationAttributeValue",
                metadataUuid: uuid,
                valueString: attrValue,
              });
              break;

            case 'LONG':
              if(attrValue) {
                order.attribute.push({
                  TYPE_NAME: "moysklad.operationAttributeValue",
                  metadataUuid: uuid,
                  longValue: parseInt(attrValue || 0, 10),
                });
              }
              break;

            case 'BOOLEAN':
              order.attribute.push({
                TYPE_NAME: "moysklad.operationAttributeValue",
                metadataUuid: uuid,
                booleanValue: attrValue,
              });
              break;

            case 'ID_CUSTOM':
              order.attribute.push({
                TYPE_NAME: "moysklad.operationAttributeValue",
                metadataUuid: uuid,
                entityValueUuid: $vm.attrDicts[attrs[i].dictionaryMetadataUuid][attrValue],
              });
          }
        }

        order.stateUuid = require('../dictsProvider').get('states', $vm.selectedOrder()._state())
        order.sourceStoreUuid = $vm.selectedWarehouse().uuid;
        order.targetAgentUuid = $vm.selectedCompany().uuid;

        order.sourceAccountUuid = order.sourceAgentUuid

        delete order.targetAccountUuid;

        setTimeout(function() {
          $client.save("moysklad.customerOrder", order, function(dummy, order){
            var vmOrder = $vm.selectedOrder(),
            data = {
              uuid: order.uuid,
              name: vmOrder._name(),
              customName: vmOrder._customName(),
              baseTemplate: $vm.basePlan().data.uuid,
              orderTemplate: templateUuid,
              presentsCount: vmOrder._presentsCount(),
              discount: vmOrder._discount(),
              sortOrder: require('../utils').getPositionsOrder(),
            };

            [ 'Interest', 'Tax', 'Output', 'Package', 'Risk'].forEach(function(param){
              param = 'primeCost' + param;
              data[param] = parseFloat( vmOrder[param]() );
            });

            $api.setOrder(order.uuid, data, function(error){
              location.reload();
            })
          });
        }, 1000);
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
            quantity: parseFloat(m._quantityPerPresent()),
            readMode: "ALL",
          });
        }
        return materials;
      };

  require('../processors/parseOrderAttributes')($vm.selectedOrder());

  if($vm.selectedOrder()._customer() == '') {
    alert('Выберите контрагента перед сохранением заказа');
    return false;
  }

  $('#site').hide();
  $('#loading').show();
  plan = $.extend(true, {}, $vm.selectedPlan().data);
  plan.name = $vm.selectedOrder()._name();
  plan.parentUuid = $vm.orderPlanFolder().uuid;

  if(templateUuid === '') {
    plan.material = [];
    products = plan.product;
    plan.product = [];
    delete(plan.uuid);
    delete(plan.updated);

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
        setTimeout(function(){ saveOrder(plan.uuid); }, 300);
      });

    });
  } else {
      var operations = $client.from('Processing').select({planUuid: templateUuid}).load(),
          isRelatedPlan = !!operations.length;

      if(!isRelatedPlan) {
        plan.material = prepareMaterials(plan)
        $client.save("moysklad.processingPlan", plan, function(error, plan){
          if(error) {
            $log('Error while saving processingPlan', error)
            return
          }
          $log('Plan updated', plan);
          require('../utils').parseProcessingPlans([plan]);
          setTimeout(function(){ saveOrder(plan.uuid); }, 300);
        });
      }
      else
      {
        setTimeout(function(){ saveOrder(plan.uuid); }, 300);
        // Пользователь не может изменять технологическую карту, но может менять некоторые поля в заказе, например статус
        // alert('Невозможно изменить технологическую карту для которой, создана технологическая операция')
        // location.reload();
      }
  }
};

},{"../dictsProvider":6,"../globals/api":7,"../globals/client":9,"../globals/vm":11,"../processors/parseOrderAttributes":30,"../utils":35}],23:[function(require,module,exports){
var $vm     = require('../globals/vm'),
    $api    = require('../globals/api'),
    $client = require('../globals/client');

module.exports = function(){
  var i, l, pos;

  var goods = require('../dataProvider').getProcessingPlanGoods($vm.basePlanForOrder().uuid);
  $api.log(goods);

  var positions = require('../processors').createPositionsByGoods(goods, $vm.basePlanForOrder().materials);
  $api.log(positions);

  // $vm.selectedPlan($vm.basePlanForOrder());
  // for(i = 0, l = positions.length; i < l; i += 1) {
  //   pos = require('../processors').createCustomerOrderPosition({data: positions[i]});
  //   $api.log(pos);
  // }
  var uuid = location.hash.match(/id=(.+)/)[1];

  var order = $client.from('CustomerOrder').select({uuid: uuid}).load()[0];

  if(!order.customerOrderPosition){
    order.customerOrderPosition = [];
  }

  for(i = 0, l = positions.length; i < l; i += 1) {
    order.customerOrderPosition.push(positions[i]);
  }

  $api.log(order);

  //TODO Should be refactored
  $client.save("moysklad.customerOrder", order, function(dummy, order){
    $api.log($vm.basePlanForOrder().data.uuid);
    $api.setOrder(order.uuid, {
      uuid: order.uuid,
      name: '',
      customName: '',
      baseTemplate: $vm.basePlanForOrder().data.uuid,
      orderTemplate: '',
      presentsCount: 10,
    }, function(error){
      location.reload();
    })
  });
}

},{"../dataProvider":4,"../globals/api":7,"../globals/client":9,"../globals/vm":11,"../processors":25}],24:[function(require,module,exports){
module.exports = {
  create: function(container){
    var table = $('<table class="taistTable primeCost">'),
        primeCostFields = [
          { title: 'Количество', bind: 'value', var: 'quantity', cls: 'tar' },
          { title: 'Скидка', bind: 'value', var: 'discount', cls: 'tar' },
          { title: 'Цена', bind: 'text', var: '_cost', cls: 'tar' },
          { title: 'Заработок', bind: 'text', var: '_income', cls: 'tar' },
          { title: 'Маржа', bind: 'text', var: '_total', cls: 'tar' },
        ];

    require('./utils').createBindedTable(
      table, primeCostFields, "primeCost()"
    );

    table.appendTo(container);
  }
}

},{"./utils":35}],25:[function(require,module,exports){
module.exports = {
  createCustomerOrderPosition: require('./processors/createCustomerOrderPosition'),
  createSumObject: require('./processors/createSumObject'),
  createPrimeCost: require('./processors/createPrimeCost'),
  createPositionsByGoods: require('./processors/createPositionsByGoods'),
}

},{"./processors/createCustomerOrderPosition":26,"./processors/createPositionsByGoods":27,"./processors/createPrimeCost":28,"./processors/createSumObject":29}],26:[function(require,module,exports){
var $api = require('../globals/api'),
    $client = require('../globals/client'),
    $dom = require('../globals/dom'),
    $app = require('../globals/app'),
    STATE = require('../state'),

    $queue = require('../requestQueue');

module.exports = function (options) {
  if(typeof options.data.vat !== 'number') {
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
      name: ko.observable(goodUuid),
      unit: ko.observable(goodUuid)
    };
  }

  koData._available = ko.observable(0);
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
      data[0] || (data[0] = {
        quantity: 0,
        stock: 0,
        reserve: 0,
        inTransit: 0,
      });

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

  koData._availabilityColor = ko.computed(function(){
    return this.quantity() > this._available() ? 'red' : 'green';
  }, koData);

  koData._name = $vm.goods[goodUuid].name;
  koData._unit = $vm.goods[goodUuid].unit;

  koData._price = ko.computed({
    read: function () {
      return (this.price.sum()/100).toFixed(2); //.replace('.', ',');
    },
    write: function (value) {
      this.price.sum(Math.round(value * 100));
      this.price.sumInCurrency(Math.round(value * 100));
      this.basePrice.sum(Math.round(value * 100));
      this.basePrice.sumInCurrency(Math.round(value * 100));
    },
    owner: koData
  });

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

},{"../globals/api":7,"../globals/app":8,"../globals/client":9,"../globals/dom":10,"../processors":25,"../requestQueue":31,"../state":33}],27:[function(require,module,exports){
module.exports = function(goods, quantitiesMap) {
  var i, l, good, positions = [];

  for( i = 0, l = goods.length; i < l; i+= 1 ) {
    good = goods[i];

    price = good.buyPrice || 0
    priceObject = {
      sum: price,
      sumInCurrency: price
    }

    positions.push({
      vat: good.vat,
      goodUuid: good.uuid,
      quantity: quantitiesMap[good.uuid],
      discount: 0,
      reserve: 0,
      basePrice: priceObject,
      price: priceObject,
    });
  }

  return positions;
}

},{}],28:[function(require,module,exports){
var $vm = require('../globals/vm');

module.exports = function (options) {
  var defaults = {
    quantity: 30,
    discount: 0,
  };

  $.extend(defaults, options);

  var primeCost = ko.mapping.fromJS(defaults);

  function round(n) {
    return Math.round(n * 100) / 100;
  }

  primeCost.costWithPackage = ko.computed(function(){
    var order = $vm.selectedOrder();
    if(!order) {
      return 0;
    }
    return parseFloat(order._pricePerPresent()) + parseFloat(order.primeCostPackage());
  });

  primeCost.cost = ko.computed(function(){
    var order = $vm.selectedOrder();
    if(!order) {
      return 0;
    }
    return round ( this.costWithPackage() *
      ( 1 + order.primeCostRisk() / 100 ) *
      ( 1 - this.discount() / 100 ) *
      ( 1 + 1 * order.primeCostInterest() ) *
      ( 1 + 1 * order.primeCostTax() ) );
  }, primeCost);

  primeCost.income = ko.computed(function(){
    var order = $vm.selectedOrder();
    if(!order) {
      return 0;
    }
    return round (
      this.cost() * order.primeCostOutput() - this.costWithPackage() * ( 1 + order.primeCostRisk() / 100 )
    );
  }, primeCost);

  primeCost.total = ko.computed(function(){
    if(!$vm.selectedOrder()) {
      return 0;
    }
    return round ( this.income() * this.quantity() );
  }, primeCost);

  ['cost', 'income', 'total'].forEach(function(param){
    primeCost['_' + param] = ko.computed(function(){
      return this[param]().toFixed(2).replace('.', ',');
    }, primeCost);
  });

  return primeCost;
}

},{"../globals/vm":11}],29:[function(require,module,exports){
module.exports = function (options) {
  return ko.mapping.fromJS(
    options.data,
    {
      copy: ['TYPE_NAME']
    }
  );
}

},{}],30:[function(require,module,exports){
var $api = require('../globals/api'),
    $vm = require('../globals/vm');

module.exports = function (order){
  var labels  = $('.b-operation-form-top td.label,  .b-operation-form-bottom td.legend'),
      widgets = $('.b-operation-form-top td.widget, .b-operation-form-bottom td.widget'),
      i, l,
      label,
      key,
      input,
      val,
      attrs = $vm.orderAttributes,
      mapping = {
        'Организация'             : '_company',
        'Контрагент'              : '_customer',
        'Сотрудник'               : '_employee',
        'Склад'                   : '_store',
        'Договор'                 : '_contract',
        'План. дата отгрузки'     : '_date',
        'Проект'                  : '_project',
      },
      props = {};

  for(i = 0, l = attrs.length; i < l; i += 1) {
    mapping[attrs[i].name] = '$' + attrs[i].uuid;
  }

  $api.log(mapping);

  for(i = 0, l = labels.length; i < l; i += 1) {
    label = $(labels[i]).text();
    key = mapping[label]
    if(typeof key !== 'undefined') {
      if(typeof order[key] !== 'function') {
        order[key] = ko.observable('');
      }
      input = $('textarea:first,input:first', widgets[i]);
      val = input.attr('type') == 'checkbox' ? input[0].checked : input.val();
      order[key](val);
      props[label] = val;
    }
  }
  $api.log('OrderProperties', props);

  val = $('.state-panel').text();
  if(typeof order._state !== 'function') {
    order._state = ko.observable('');
  }
  order._state(val);
}

},{"../globals/api":7,"../globals/vm":11}],31:[function(require,module,exports){
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

},{"./globals/api":7}],32:[function(require,module,exports){
var $api = require('./globals/api')
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
    waitForObject(100, ko, 'mapping', function(){
      callback();
    });
  });
}

function setupDicts(taistOptions) {

  dictsProvider = require('./dictsProvider')

  dictsProvider.register('units', function(){
    var units = {}
    $client.from('Uom').load().forEach(function(uom){
      units[uom.uuid] = uom.name;
    });
    return units;
  })

  dictsProvider.register('states', function(){
    var states = {};
    $client.from('Workflow')
    .select({code: 'CustomerOrder'})
    .load()[0].state.forEach(function(state){
      states[state.name] = state.uuid;
    });
    states['_dummyHotFix'] = '_dummyHotFix';
    return states;
  })

  ['Company', 'Employee', 'Contract', 'Project'].forEach(function(collection){
    dictsProvider.register(collection, function(){
      var result = {};
      $client.from(collection).load().forEach(function(entity){
        units[entity.name] = entity.uuid;
      });
      return result;
    })
  })

  var dummy = dictsProvider.get('states', '_dummyHotFix');

  setTimeout(function() {
    $vm.attrDicts = {};
    $vm.orderAttributes = $client
      .from('embeddedEntityMetadata')
      .select({name: 'CustomerOrder'})
      .load()[0].attributeMetadata
      .map(function(attr) {
        if(attr.dictionaryMetadataUuid) {

            $vm.attrDicts[attr.dictionaryMetadataUuid] = require('./utils').
              getFromLocalStorage(attr.dictionaryMetadataUuid, function(key){
                var result = {};

                $client
                  .from('customEntity')
                  .select({entityMetadataUuid: key})
                  .load().forEach(function(entity){
                    result[entity.name] = entity.uuid;
                  });

                return result;
              });
        }

        return {
          attrType: attr.attrType,
          uuid: attr.uuid,
          name: attr.name,
          entityMetadataUuid: attr.entityMetadataUuid,
          dictionaryMetadataUuid: attr.dictionaryMetadataUuid,
        }
      });
    }, 200);
}

function onCompanyDataLoaded(error, taistOptions) {
  taistOptions || (taistOptions = {});

  setupDicts(taistOptions);

  $div = $('<div id="taist">')
    .css({display: 'none'})
    .prependTo('body');

  var div;

  div = $('<div id = "taist_processingPlans">');
  $("<select>")
    .attr('data-bind', "options: baseProcessingPlans, optionsText: 'name', value: selectedBasePlan")
    .css({ width: 400 })
    .appendTo(div);

  $("<button>")
    .text('Заказ по шаблону')
    .css({marginLeft: 20})
    .click(require('./handlers').onNewCustomerOrder)
    .appendTo(div);

  div.appendTo($div);

  div = $('<div id = "taist_basePlanForOrder">');
  $("<select>")
    .attr('data-bind', "options: baseProcessingPlans, optionsText: 'name', value: basePlanForOrder")
    .css({ width: 400 })
    .appendTo(div);

  $("<button>")
    .text('Добавить позиции из шаблона')
    .css({ marginLeft: 20, width: 200 })
    .click(require('./handlers').onSelectBasePlanForCustomerOrder)
    .appendTo(div);

  div.appendTo($div);

  $vm.processingPlans = ko.observableArray([]).extend({ rateLimit: 50 });

  $vm.selectedPlan = ko.observable(null);
  $vm.basePlan = ko.observable(null);
  $vm.selectedBasePlan = ko.observable(null);

  $vm.basePlan.subscribe(function(){
    $api.log($vm.basePlan());
  });

  $vm.basePlanForOrder = ko.observable(null);

  var processingPlans, shouldSaveOptions = false;

  if(typeof taistOptions.processingPlans === 'undefined') {
    processingPlans = $client.from('ProcessingPlan').load();
    shouldSaveOptions = true;
  } else {
    processingPlans = taistOptions.processingPlans;
  }

  require('./utils').parseProcessingPlans(processingPlans);

  $vm.processingPlans.sort(function(a, b){return a.name < b.name ? -1 : 1});

  $vm.baseProcessingPlans = ko.computed(function(){
    return ko.utils.arrayFilter($vm.processingPlans(), function(plan) {
      return plan.data.parentUuid === taistOptions.basePlanFolder;
    });
  }).extend({ rateLimit: 1 });

  $vm.primeCostInterest = ko.observable(taistOptions.primeCostInterest || 1.2);
  $vm.primeCostTax = ko.observable(taistOptions.primeCostTax || 0.0262);
  $vm.primeCostOutput = ko.observable(taistOptions.primeCostOutput || 0.945);
  $vm.primeCostPackage = ko.observable(taistOptions.primeCostPackage || 10);
  $vm.primeCostRisk = ko.observable(taistOptions.primeCostRisk || 5);
  $vm.primeCostDiscount = ko.observable(taistOptions.primeCostDiscount || 0);

  $vm.onCreateGoodsForOrder = function(){
    require('./handlers').onCreateGoodsForOrder();
  }

  var settingsDiv = require('./taistSettingsInterface').create(taistOptions);
  settingsDiv.appendTo($div);
  ko.applyBindings($vm, $div[0]);

  var td = $('<td align="left" style="vertical-align: top; padding-left: 20px;">');

  settingsDiv.appendTo(td);

  $('<img src="http://www.tai.st/images/logo_sq_180.png">')
    .css({
      width: 24,
      cursor: 'pointer',
      position: 'absolute',
      right: 40,
      top: 60,
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

  $vm.primeCost = ko.observableArray([]);

  var createPrimeCost = require('./processors').createPrimeCost;
  $vm.primeCost.push( createPrimeCost({ quantity: 30 }) );
  $vm.primeCost.push( createPrimeCost({ quantity: 100, discount: 7 }) );
  $vm.primeCost.push( createPrimeCost({ quantity: 200, discount: 10 }) );
  $vm.primeCost.push( createPrimeCost({ quantity: 500, discount: 13 }) );

  var primeCostForPresentsCount = createPrimeCost({ quantity: 1, discount: $vm.primeCostDiscount() });
  $vm.primeCost.push(primeCostForPresentsCount);
  $vm.presentsCount.subscribe(function(){
    primeCostForPresentsCount.quantity( $vm.presentsCount() );
  })

  $vm.primeCostDiscount.subscribe(function(val){
    primeCostForPresentsCount.discount(val);
  });

  primeCostForPresentsCount.discount.subscribe(function(val){
    var order = $vm.selectedOrder();
    if(order !== null) {
      order._discount(val);
    }
  })

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

  if(shouldSaveOptions) {
    require('./utils').saveTaistOptions();
  }
}

function onStart(_taistApi) {

  $.extend($api, _taistApi);
  window.$api = $api;

  require('./utils').extendApi($api);

  $api.log('onStart');

  waitForKnockout(100, function(){
    $api.log('knockout loaded');

    $.extend($client, window.require('moysklad-client').createClient());

    var xmlhttphandlers = require("./xmlhttphandlers");
    require("./xmlhttpproxy").registerHandlers( xmlhttphandlers );

    $api.userData.get('taistOptions', function(error, taistOptions){
      taistOptions || (taistOptions = {});

      if(taistOptions.moyskladClientUser && taistOptions.moyskladClientUser.length > 0
      && taistOptions.moyskladClientPass && taistOptions.moyskladClientPass.length > 0) {
        $client.setAuth(taistOptions.moyskladClientUser, taistOptions.moyskladClientPass);
      }

      $vm.moyskladClientUser = ko.observable(taistOptions.moyskladClientUser || '');
      $vm.moyskladClientPass = ko.observable(taistOptions.moyskladClientPass || '');

      $vm.companyUuid = $api.localStorage.get('companyUuid');
      if(!$vm.companyUuid) {
        $vm.companyUuid = ($client.from('MyCompany').load()[0] || {}).uuid;
        $api.localStorage.set('companyUuid', $vm.companyUuid);
      }

      $vm.employeeUuid = $api.localStorage.get('employeeUuid');
      if(!$vm.employeeUuid) {
        $vm.employeeUuid = ($client.from('Employee').select( { name: ($('.full-name').text() || '') } ).load()[0] || {}).uuid;
        $api.localStorage.set('employeeUuid', $vm.employeeUuid || '');
      }

      console.log('setCompanyKey', $vm.companyUuid);
      $api.companyData.setCompanyKey($vm.companyUuid);
      $api.companyData.get('taistOptions', onCompanyDataLoaded);

      $vm.parseOrderAttributes = require('./processors/parseOrderAttributes');
    });
  });
}

module.exports = onStart

},{"./customerOrderInterface":3,"./dictsProvider":6,"./globals/api":7,"./globals/app":8,"./globals/client":9,"./globals/dom":10,"./globals/vm":11,"./handlers":12,"./processors":25,"./processors/parseOrderAttributes":30,"./state":33,"./taistSettingsInterface":34,"./utils":35,"./xmlhttphandlers":44,"./xmlhttpproxy":45}],33:[function(require,module,exports){
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

},{}],34:[function(require,module,exports){
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
        require('./utils').resetLocalStorage();
        require('./utils').saveTaistOptions();
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

},{"./globals/api":7,"./globals/client":9,"./globals/vm":11,"./utils":35}],35:[function(require,module,exports){
module.exports = {
  parseProcessingPlans: require('./utils/parseProcessingPlans'),

  saveTaistOptions: require('./utils/saveTaistOptions'),
  getPositionsOrder: require('./utils/getPositionsOrder'),
  getFromLocalStorage: require('./utils/getFromLocalStorage'),
  resetLocalStorage: require('./utils/resetLocalStorage'),

  createBindedTable: require('./utils/createBindedTable'),
  waitForElement: require('./utils/waitForElement'),

  extendApi: require('./utils/extendApi'),
}

},{"./utils/createBindedTable":36,"./utils/extendApi":37,"./utils/getFromLocalStorage":38,"./utils/getPositionsOrder":39,"./utils/parseProcessingPlans":40,"./utils/resetLocalStorage":41,"./utils/saveTaistOptions":42,"./utils/waitForElement":43}],36:[function(require,module,exports){
module.exports = function(table, fields, collectionName) {
  var thead  = $('<thead>').appendTo(table),
      trhead = $('<tr>').appendTo(thead),
      tbody  = $('<tbody data-bind="foreach: ' + collectionName + '">').appendTo(table),
      trbody = $('<tr>').appendTo(tbody);

  fields.map(function(item){
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
  });
}

},{}],37:[function(require,module,exports){
var $client = require('../globals/client');

module.exports = function(api) {
  api.getOrder = function(uuid, callback) {
    api.companyData.getPart('ordersList', uuid, callback);
  }

  api.getOrdersList = function(callback) {
    api.companyData.get('ordersList', function(error, data){
      callback(error, data);
      api.getOrdersList = function(callback) {
        callback(error, data);
      }
    });
  }

  api.setOrder = function(uuid, data, callback) {
    api.companyData.setPart('ordersList', uuid, data, callback);
  }

  api.moysklad = {};

  api.moysklad.cloneGood = function(uuid, newName) {
    var goods = $client.from('Good').select({uuid: uuid}).load(),
        good;

    if(goods) {

      good = goods[0];
      delete(good.uuid);
      delete(good.externalcode);

      if(good.attribute) {
        good.attribute = good.attribute.map(function(attr){
          delete(attr.uuid);
          delete(attr.goodUuid);
          return attr;
        });
      }

      if(good.salePrices) {
        good.salePrices = good.salePrices.map(function(price){
          delete(price.uuid);
          return price;
        });
      }

      if(newName) {
        if(typeof(newName) === 'function') {
          good.name = newName(good.name);
        } else {
          good.name = newName;
        }
      } else {
          good.name += ' ' + new Date().getTime()
      }
    }
    return good;
  }
}

},{"../globals/client":9}],38:[function(require,module,exports){
var $api = require('../globals/api'),
    $vm = require('../globals/vm');

module.exports = function(key, callback, forceUpdate) {
  var storedData = $api.localStorage.get($vm.companyUuid) || {};
  if(!storedData[key]) {
    storedData[key] = callback(key);
    $api.localStorage.set($vm.companyUuid, storedData);
  }
  else if (forceUpdate) {
    data = callback(key);
    Object.keys(data).forEach(function(entityKey){
      storedData[key][entityKey] = data[entityKey]
    })
    $api.localStorage.set($vm.companyUuid, storedData);
  }
  return storedData[key];
}

},{"../globals/api":7,"../globals/vm":11}],39:[function(require,module,exports){
module.exports = function() {
  return $('tr', '.taist-table')
    .not(':first')
    .toArray()
    .map(function(i) {
      return ko.dataFor(i).uuid
    });
}

},{}],40:[function(require,module,exports){
var $vm = require('../globals/vm');

module.exports = function(plans) {
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

},{"../globals/vm":11}],41:[function(require,module,exports){
var $api = require('../globals/api'),
    $vm = require('../globals/vm');

module.exports = function() {
  $api.localStorage.set($vm.companyUuid, null);
}

},{"../globals/api":7,"../globals/vm":11}],42:[function(require,module,exports){
var $api = require('../globals/api'),
    $vm = require('../globals/vm');

module.exports = function() {
  var processingPlans = [];
  $vm.baseProcessingPlans().forEach(function(plan){
    processingPlans.push(plan.data);
  })

  if(processingPlans.length === 0) {
    processingPlans = undefined;
  }

  $api.companyData.set('taistOptions', {
    basePlanFolder: ($vm.basePlanFolder()     || {}).uuid,
    orderPlanFolder: ($vm.orderPlanFolder()    || {}).uuid,
    selectedWarehouse: ($vm.selectedWarehouse()  || {}).uuid,
    selectedCompany: ($vm.selectedCompany()    || {}).uuid,

    processingPlans: processingPlans,
    processingPlansFolder: $vm.processingPlanFolders(),

    primeCostInterest: $vm.primeCostInterest(),
    primeCostTax: $vm.primeCostTax(),
    primeCostOutput: $vm.primeCostOutput(),
    primeCostPackage: $vm.primeCostPackage(),
    primeCostRisk: $vm.primeCostRisk(),
  }, function(){});

  $api.userData.set('taistOptions', {
    moyskladClientUser: $vm.moyskladClientUser(),
    moyskladClientPass: $vm.moyskladClientPass(),
  }, function(){});
}

},{"../globals/api":7,"../globals/vm":11}],43:[function(require,module,exports){
var elementsCallbacks = [];

function runListener(){
  var i, elem;

  for(i in elementsCallbacks) {
    elem = $(i);
    if(elem.size() > 0) {
      elementsCallbacks[i]();
      delete elementsCallbacks[i];
    }
  }

  for(i in elementsCallbacks) {
    setTimeout(runListener, 200);
    return;
  }
}

module.exports = function(selector, callback) {
  elementsCallbacks[selector] = callback;
  runListener();
}

},{}],44:[function(require,module,exports){
var $app    = require('./globals/app'),
    $api    = require('./globals/api'),
    $client = require('./globals/client'),
    STATE   = require('./state');



module.exports = {
  'CommonService.getItemTO': function(requestData, responseText){
    $api.log('CommonService.getItemTO', requestData, responseText);
    var state = $app.getLastState(), tmp;
    if(!state
      ||
        state.name !== STATE.ORDER.newGoodWaited
        && state.name !== STATE.ORDER.newGoodSelected )
    {
      return false;
    }

    var pattern = /"(Good)",.+,"([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})"\]/,
        matches = responseText.match(pattern);

    if(!matches) {
      pattern = /"([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})","[^"]+","(Good)"/,
      matches = responseText.match(pattern);
      if(matches) {
        tmp = matches[2];
        matches[2] = matches[1];
        matches[1] = tmp;
      }
    }

    if(matches) {
      $api.log('CommonService.getItemTO', 'Good Found', matches[2]);

      $app.changeState(STATE.ORDER.newGoodSelected, {
        uuid: matches[2],
        name: $client.from(matches[1]).select({uuid: matches[2]}).load()[0].name,
        type: matches[1]
      });
    }
  },

  'ConsignmentService.getGoodConsignmentList': function(requestData, responseText){
  },

  'OrderService.stockForConsignmentsWithReserve': function(requestData, responseText){
    // $api.log(requestData, responseText);
    var state = $app.getLastState();
    if(!state || state.name !== STATE.ORDER.newGoodSelected) {
      return false;
    }

    $api.log('New position', state.data);
    $client.load(state.data.type, state.data.uuid, function(dummy, good){

      if(!$vm.goods[good.uuid]) {
        $vm.goods[good.uuid] = {
          name: ko.observable(good.name),
          unit: ko.observable( require('./dictsProvider').get('units', good.uomUuid) ),
        };
      }

      var price = good.buyPrice || 0;
      var priceObject = {
        sum: price,
        sumInCurrency: price
      };
      var position = require('./processors').createCustomerOrderPosition({
        data: {
          vat: good.vat,
          goodUuid: good.uuid,
          quantity: 1,
          discount: 0,
          reserve: 0,
          basePrice: priceObject,
          price: priceObject,
        }
      });

      var order = $vm.selectedOrder();
      position._quantity = ko.computed(function(){
        var quantity = this._quantityPerPresent() * order._presentsCount();
        quantity = Math.round(quantity * 1000000)/1000000;
        this.quantity(quantity);
        return quantity;
      }, position);

      // $api.log(position);
      order.customerOrderPosition.push(position);
      $app.changeState(STATE.ORDER.newGoodWaited, {});
    });
  },

}

},{"./dictsProvider":6,"./globals/api":7,"./globals/app":8,"./globals/client":9,"./processors":25,"./state":33}],45:[function(require,module,exports){
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
                //$api.log('REQUEST', service, method, self.responseText);
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

},{"./globals/api":7}]},{},["U+ghpQ"]);return require("atrspb")};
/* ===================================================
 *  jquery-sortable.js v0.9.12
 *  http://johnny.github.com/jquery-sortable/
 * ===================================================
 *  Copyright (c) 2012 Jonas von Andrian
 *  All rights reserved.
 *
 *  Redistribution and use in source and binary forms, with or without
 *  modification, are permitted provided that the following conditions are met:
 *  * Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *  * The name of the author may not be used to endorse or promote products
 *    derived from this software without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 *  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 *  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 *  DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
 *  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 *  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 *  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 *  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 *  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 *  SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 * ========================================================== */


!function ( $, window, pluginName, undefined){
  var eventNames,
  containerDefaults = {
    // If true, items can be dragged from this container
    drag: true,
    // If true, items can be droped onto this container
    drop: true,
    // Exclude items from being draggable, if the
    // selector matches the item
    exclude: "",
    // If true, search for nested containers within an item
    nested: true,
    // If true, the items are assumed to be arranged vertically
    vertical: true
  }, // end container defaults
  groupDefaults = {
    // This is executed after the placeholder has been moved.
    // $closestItemOrContainer contains the closest item, the placeholder
    // has been put at or the closest empty Container, the placeholder has
    // been appended to.
    afterMove: function ($placeholder, container, $closestItemOrContainer) {
    },
    // The exact css path between the container and its items, e.g. "> tbody"
    containerPath: "",
    // The css selector of the containers
    containerSelector: "ol, ul",
    // Distance the mouse has to travel to start dragging
    distance: 0,
    // Time in milliseconds after mousedown until dragging should start.
    // This option can be used to prevent unwanted drags when clicking on an element.
    delay: 0,
    // The css selector of the drag handle
    handle: "",
    // The exact css path between the item and its subcontainers
    itemPath: "",
    // The css selector of the items
    itemSelector: "li",
    // Check if the dragged item may be inside the container.
    // Use with care, since the search for a valid container entails a depth first search
    // and may be quite expensive.
    isValidTarget: function ($item, container) {
      return true
    },
    // Executed before onDrop if placeholder is detached.
    // This happens if pullPlaceholder is set to false and the drop occurs outside a container.
    onCancel: function ($item, container, _super, event) {
    },
    // Executed at the beginning of a mouse move event.
    // The Placeholder has not been moved yet.
    onDrag: function ($item, position, _super, event) {
      $item.css(position)
    },
    // Called after the drag has been started,
    // that is the mouse button is beeing held down and
    // the mouse is moving.
    // The container is the closest initialized container.
    // Therefore it might not be the container, that actually contains the item.
    onDragStart: function ($item, container, _super, event) {
      $item.css({
        height: $item.height(),
        width: $item.width()
      })
      $item.addClass("dragged")
      $("body").addClass("dragging")
    },
    // Called when the mouse button is beeing released
    onDrop: function ($item, container, _super, event) {
      $item.removeClass("dragged").removeAttr("style")
      $("body").removeClass("dragging")
    },
    // Called on mousedown. If falsy value is returned, the dragging will not start.
    // If clicked on input element, ignore
    onMousedown: function ($item, _super, event) {
      if (!event.target.nodeName.match(/^(input|select)$/i)) {
        event.preventDefault()
        return true
      }
    },
    // Template for the placeholder. Can be any valid jQuery input
    // e.g. a string, a DOM element.
    // The placeholder must have the class "placeholder"
    placeholder: '<li class="placeholder"/>',
    // If true, the position of the placeholder is calculated on every mousemove.
    // If false, it is only calculated when the mouse is above a container.
    pullPlaceholder: true,
    // Specifies serialization of the container group.
    // The pair $parent/$children is either container/items or item/subcontainers.
    serialize: function ($parent, $children, parentIsContainer) {
      var result = $.extend({}, $parent.data())

      if(parentIsContainer)
        return [$children]
      else if ($children[0]){
        result.children = $children
      }

      delete result.subContainers
      delete result.sortable

      return result
    },
    // Set tolerance while dragging. Positive values decrease sensitivity,
    // negative values increase it.
    tolerance: 0
  }, // end group defaults
  containerGroups = {},
  groupCounter = 0,
  emptyBox = {
    left: 0,
    top: 0,
    bottom: 0,
    right:0
  },
  eventNames = {
    start: "touchstart.sortable mousedown.sortable",
    drop: "touchend.sortable touchcancel.sortable mouseup.sortable",
    drag: "touchmove.sortable mousemove.sortable",
    scroll: "scroll.sortable"
  },
  subContainerKey = "subContainers"

  /*
   * a is Array [left, right, top, bottom]
   * b is array [left, top]
   */
  function d(a,b) {
    var x = Math.max(0, a[0] - b[0], b[0] - a[1]),
    y = Math.max(0, a[2] - b[1], b[1] - a[3])
    return x+y;
  }

  function setDimensions(array, dimensions, tolerance, useOffset) {
    var i = array.length,
    offsetMethod = useOffset ? "offset" : "position"
    tolerance = tolerance || 0

    while(i--){
      var el = array[i].el ? array[i].el : $(array[i]),
      // use fitting method
      pos = el[offsetMethod]()
      pos.left += parseInt(el.css('margin-left'), 10)
      pos.top += parseInt(el.css('margin-top'),10)
      dimensions[i] = [
        pos.left - tolerance,
        pos.left + el.outerWidth() + tolerance,
        pos.top - tolerance,
        pos.top + el.outerHeight() + tolerance
      ]
    }
  }

  function getRelativePosition(pointer, element) {
    var offset = element.offset()
    return {
      left: pointer.left - offset.left,
      top: pointer.top - offset.top
    }
  }

  function sortByDistanceDesc(dimensions, pointer, lastPointer) {
    pointer = [pointer.left, pointer.top]
    lastPointer = lastPointer && [lastPointer.left, lastPointer.top]

    var dim,
    i = dimensions.length,
    distances = []

    while(i--){
      dim = dimensions[i]
      distances[i] = [i,d(dim,pointer), lastPointer && d(dim, lastPointer)]
    }
    distances = distances.sort(function  (a,b) {
      return b[1] - a[1] || b[2] - a[2] || b[0] - a[0]
    })

    // last entry is the closest
    return distances
  }

  function ContainerGroup(options) {
    this.options = $.extend({}, groupDefaults, options)
    this.containers = []

    if(!this.options.rootGroup){
      this.scrollProxy = $.proxy(this.scroll, this)
      this.dragProxy = $.proxy(this.drag, this)
      this.dropProxy = $.proxy(this.drop, this)
      this.placeholder = $(this.options.placeholder)

      if(!options.isValidTarget)
        this.options.isValidTarget = undefined
    }
  }

  ContainerGroup.get = function  (options) {
    if(!containerGroups[options.group]) {
      if(options.group === undefined)
        options.group = groupCounter ++

      containerGroups[options.group] = new ContainerGroup(options)
    }

    return containerGroups[options.group]
  }

  ContainerGroup.prototype = {
    dragInit: function  (e, itemContainer) {
      this.$document = $(itemContainer.el[0].ownerDocument)

      // get item to drag
      this.item = $(e.target).closest(this.options.itemSelector)
      this.itemContainer = itemContainer

      if(this.item.is(this.options.exclude) ||
         !this.options.onMousedown(this.item, groupDefaults.onMousedown, e)){
        return
      }

      this.setPointer(e)
      this.toggleListeners('on')

      this.setupDelayTimer()
      this.dragInitDone = true
    },
    drag: function  (e) {
      if(!this.dragging){
        if(!this.distanceMet(e) || !this.delayMet)
          return

        this.options.onDragStart(this.item, this.itemContainer, groupDefaults.onDragStart, e)
        this.item.before(this.placeholder)
        this.dragging = true
      }

      this.setPointer(e)
      // place item under the cursor
      this.options.onDrag(this.item,
                          getRelativePosition(this.pointer, this.item.offsetParent()),
                          groupDefaults.onDrag,
                          e)

      var x = e.pageX || e.originalEvent.pageX,
      y = e.pageY || e.originalEvent.pageY,
      box = this.sameResultBox,
      t = this.options.tolerance

      if(!box || box.top - t > y || box.bottom + t < y || box.left - t > x || box.right + t < x)
        if(!this.searchValidTarget())
          this.placeholder.detach()
    },
    drop: function  (e) {
      this.toggleListeners('off')

      this.dragInitDone = false

      if(this.dragging){
        // processing Drop, check if placeholder is detached
        if(this.placeholder.closest("html")[0])
          this.placeholder.before(this.item).detach()
        else
          this.options.onCancel(this.item, this.itemContainer, groupDefaults.onCancel, e)

        this.options.onDrop(this.item, this.getContainer(this.item), groupDefaults.onDrop, e)

        // cleanup
        this.clearDimensions()
        this.clearOffsetParent()
        this.lastAppendedItem = this.sameResultBox = undefined
        this.dragging = false
      }
    },
    searchValidTarget: function  (pointer, lastPointer) {
      if(!pointer){
        pointer = this.relativePointer || this.pointer
        lastPointer = this.lastRelativePointer || this.lastPointer
      }

      var distances = sortByDistanceDesc(this.getContainerDimensions(),
                                         pointer,
                                         lastPointer),
      i = distances.length

      while(i--){
        var index = distances[i][0],
        distance = distances[i][1]

        if(!distance || this.options.pullPlaceholder){
          var container = this.containers[index]
          if(!container.disabled){
            if(!this.$getOffsetParent()){
              var offsetParent = container.getItemOffsetParent()
              pointer = getRelativePosition(pointer, offsetParent)
              lastPointer = getRelativePosition(lastPointer, offsetParent)
            }
            if(container.searchValidTarget(pointer, lastPointer))
              return true
          }
        }
      }
      if(this.sameResultBox)
        this.sameResultBox = undefined
    },
    movePlaceholder: function  (container, item, method, sameResultBox) {
      var lastAppendedItem = this.lastAppendedItem
      if(!sameResultBox && lastAppendedItem && lastAppendedItem[0] === item[0])
        return;

      item[method](this.placeholder)
      this.lastAppendedItem = item
      this.sameResultBox = sameResultBox
      this.options.afterMove(this.placeholder, container, item)
    },
    getContainerDimensions: function  () {
      if(!this.containerDimensions)
        setDimensions(this.containers, this.containerDimensions = [], this.options.tolerance, !this.$getOffsetParent())
      return this.containerDimensions
    },
    getContainer: function  (element) {
      return element.closest(this.options.containerSelector).data(pluginName)
    },
    $getOffsetParent: function  () {
      if(this.offsetParent === undefined){
        var i = this.containers.length - 1,
        offsetParent = this.containers[i].getItemOffsetParent()

        if(!this.options.rootGroup){
          while(i--){
            if(offsetParent[0] != this.containers[i].getItemOffsetParent()[0]){
              // If every container has the same offset parent,
              // use position() which is relative to this parent,
              // otherwise use offset()
              // compare #setDimensions
              offsetParent = false
              break;
            }
          }
        }

        this.offsetParent = offsetParent
      }
      return this.offsetParent
    },
    setPointer: function (e) {
      var pointer = this.getPointer(e)

      if(this.$getOffsetParent()){
        var relativePointer = getRelativePosition(pointer, this.$getOffsetParent())
        this.lastRelativePointer = this.relativePointer
        this.relativePointer = relativePointer
      }

      this.lastPointer = this.pointer
      this.pointer = pointer
    },
    distanceMet: function (e) {
      var currentPointer = this.getPointer(e)
      return (Math.max(
        Math.abs(this.pointer.left - currentPointer.left),
        Math.abs(this.pointer.top - currentPointer.top)
      ) >= this.options.distance)
    },
    getPointer: function(e) {
      return {
        left: e.pageX || e.originalEvent.pageX,
        top: e.pageY || e.originalEvent.pageY
      }
    },
    setupDelayTimer: function () {
      var that = this
      this.delayMet = !this.options.delay

      // init delay timer if needed
      if (!this.delayMet) {
        clearTimeout(this._mouseDelayTimer);
        this._mouseDelayTimer = setTimeout(function() {
          that.delayMet = true
        }, this.options.delay)
      }
    },
    scroll: function  (e) {
      this.clearDimensions()
      this.clearOffsetParent() // TODO is this needed?
    },
    toggleListeners: function (method) {
      var that = this,
      events = ['drag','drop','scroll']

      $.each(events,function  (i,event) {
        that.$document[method](eventNames[event], that[event + 'Proxy'])
      })
    },
    clearOffsetParent: function () {
      this.offsetParent = undefined
    },
    // Recursively clear container and item dimensions
    clearDimensions: function  () {
      this.traverse(function(object){
        object._clearDimensions()
      })
    },
    traverse: function(callback) {
      callback(this)
      var i = this.containers.length
      while(i--){
        this.containers[i].traverse(callback)
      }
    },
    _clearDimensions: function(){
      this.containerDimensions = undefined
    },
    _destroy: function () {
      containerGroups[this.options.group] = undefined
    }
  }

  function Container(element, options) {
    this.el = element
    this.options = $.extend( {}, containerDefaults, options)

    this.group = ContainerGroup.get(this.options)
    this.rootGroup = this.options.rootGroup || this.group
    this.handle = this.rootGroup.options.handle || this.rootGroup.options.itemSelector

    var itemPath = this.rootGroup.options.itemPath
    this.target = itemPath ? this.el.find(itemPath) : this.el

    this.target.on(eventNames.start, this.handle, $.proxy(this.dragInit, this))

    if(this.options.drop)
      this.group.containers.push(this)
  }

  Container.prototype = {
    dragInit: function  (e) {
      var rootGroup = this.rootGroup

      if( !this.disabled &&
          !rootGroup.dragInitDone &&
          this.options.drag &&
          this.isValidDrag(e)) {
        rootGroup.dragInit(e, this)
      }
    },
    isValidDrag: function(e) {
      return e.which == 1 ||
        e.type == "touchstart" && e.originalEvent.touches.length == 1
    },
    searchValidTarget: function  (pointer, lastPointer) {
      var distances = sortByDistanceDesc(this.getItemDimensions(),
                                         pointer,
                                         lastPointer),
      i = distances.length,
      rootGroup = this.rootGroup,
      validTarget = !rootGroup.options.isValidTarget ||
        rootGroup.options.isValidTarget(rootGroup.item, this)

      if(!i && validTarget){
        rootGroup.movePlaceholder(this, this.target, "append")
        return true
      } else
        while(i--){
          var index = distances[i][0],
          distance = distances[i][1]
          if(!distance && this.hasChildGroup(index)){
            var found = this.getContainerGroup(index).searchValidTarget(pointer, lastPointer)
            if(found)
              return true
          }
          else if(validTarget){
            this.movePlaceholder(index, pointer)
            return true
          }
        }
    },
    movePlaceholder: function  (index, pointer) {
      var item = $(this.items[index]),
      dim = this.itemDimensions[index],
      method = "after",
      width = item.outerWidth(),
      height = item.outerHeight(),
      offset = item.offset(),
      sameResultBox = {
        left: offset.left,
        right: offset.left + width,
        top: offset.top,
        bottom: offset.top + height
      }
      if(this.options.vertical){
        var yCenter = (dim[2] + dim[3]) / 2,
        inUpperHalf = pointer.top <= yCenter
        if(inUpperHalf){
          method = "before"
          sameResultBox.bottom -= height / 2
        } else
          sameResultBox.top += height / 2
      } else {
        var xCenter = (dim[0] + dim[1]) / 2,
        inLeftHalf = pointer.left <= xCenter
        if(inLeftHalf){
          method = "before"
          sameResultBox.right -= width / 2
        } else
          sameResultBox.left += width / 2
      }
      if(this.hasChildGroup(index))
        sameResultBox = emptyBox
      this.rootGroup.movePlaceholder(this, item, method, sameResultBox)
    },
    getItemDimensions: function  () {
      if(!this.itemDimensions){
        this.items = this.$getChildren(this.el, "item").filter(":not(.placeholder, .dragged)").get()
        setDimensions(this.items, this.itemDimensions = [], this.options.tolerance)
      }
      return this.itemDimensions
    },
    getItemOffsetParent: function  () {
      var offsetParent,
      el = this.el
      // Since el might be empty we have to check el itself and
      // can not do something like el.children().first().offsetParent()
      if(el.css("position") === "relative" || el.css("position") === "absolute"  || el.css("position") === "fixed")
        offsetParent = el
      else
        offsetParent = el.offsetParent()
      return offsetParent
    },
    hasChildGroup: function (index) {
      return this.options.nested && this.getContainerGroup(index)
    },
    getContainerGroup: function  (index) {
      var childGroup = $.data(this.items[index], subContainerKey)
      if( childGroup === undefined){
        var childContainers = this.$getChildren(this.items[index], "container")
        childGroup = false

        if(childContainers[0]){
          var options = $.extend({}, this.options, {
            rootGroup: this.rootGroup,
            group: groupCounter ++
          })
          childGroup = childContainers[pluginName](options).data(pluginName).group
        }
        $.data(this.items[index], subContainerKey, childGroup)
      }
      return childGroup
    },
    $getChildren: function (parent, type) {
      var options = this.rootGroup.options,
      path = options[type + "Path"],
      selector = options[type + "Selector"]

      parent = $(parent)
      if(path)
        parent = parent.find(path)

      return parent.children(selector)
    },
    _serialize: function (parent, isContainer) {
      var that = this,
      childType = isContainer ? "item" : "container",

      children = this.$getChildren(parent, childType).not(this.options.exclude).map(function () {
        return that._serialize($(this), !isContainer)
      }).get()

      return this.rootGroup.options.serialize(parent, children, isContainer)
    },
    traverse: function(callback) {
      $.each(this.items || [], function(item){
        var group = $.data(this, subContainerKey)
        if(group)
          group.traverse(callback)
      });

      callback(this)
    },
    _clearDimensions: function  () {
      this.itemDimensions = undefined
    },
    _destroy: function() {
      var that = this;

      this.target.off(eventNames.start, this.handle);
      this.el.removeData(pluginName)

      if(this.options.drop)
        this.group.containers = $.grep(this.group.containers, function(val){
          return val != that
        })

      $.each(this.items || [], function(){
        $.removeData(this, subContainerKey)
      })
    }
  }

  var API = {
    enable: function() {
      this.traverse(function(object){
        object.disabled = false
      })
    },
    disable: function (){
      this.traverse(function(object){
        object.disabled = true
      })
    },
    serialize: function () {
      return this._serialize(this.el, true)
    },
    refresh: function() {
      this.traverse(function(object){
        object._clearDimensions()
      })
    },
    destroy: function () {
      this.traverse(function(object){
        object._destroy();
      })
    }
  }

  $.extend(Container.prototype, API)

  /**
   * jQuery API
   *
   * Parameters are
   *   either options on init
   *   or a method name followed by arguments to pass to the method
   */
  $.fn[pluginName] = function(methodOrOptions) {
    var args = Array.prototype.slice.call(arguments, 1)

    return this.map(function(){
      var $t = $(this),
      object = $t.data(pluginName)

      if(object && API[methodOrOptions])
        return API[methodOrOptions].apply(object, args) || this
      else if(!object && (methodOrOptions === undefined ||
                          typeof methodOrOptions === "object"))
        $t.data(pluginName, new Container($t, methodOrOptions))

      return this
    });
  };

}(jQuery, window, 'sortable');
