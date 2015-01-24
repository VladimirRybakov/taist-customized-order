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
            unit: ko.observable( $vm.getFromDict('units', good.uomUuid) )
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
