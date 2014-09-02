var $api = require('../globals/api'),
    $client = require('../globals/client'),
    $dom = require('../globals/dom'),
    $app = require('../globals/app'),
    STATE = require('../state');

function parseOrderData(order){
  var labels  = $('.b-operation-form-top td.label'),
      widgets = $('.b-operation-form-top td.widget'),
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
        'Проект': '_project',
      };

  for(i = 0, l = labels.length; i < l; i += 1) {
    label = $(labels[i]).text();
    key = mapping[label]
    if(typeof key !== 'undefined') {
      if(typeof order[key] != 'function') {
        order[key] = ko.observable('');
      }
      order[key]( $('input:first', widgets[i]).val() );
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

    if(typeof taistOrderData === 'undefined') {
      $('body').removeClass('newOrderInterface');
      return;
    }

    var processingPlans = $client.from('ProcessingPlan')
      .select( { uuid: (taistOrderData.orderTemplate || taistOrderData.baseTemplate) } )
      .load();

    require('../utils').parseProcessingPlans(processingPlans);

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
      order = $.extend({description: ''}, orderData);
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
