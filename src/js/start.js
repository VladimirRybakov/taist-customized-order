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

  $vm.units = {};
  $client.from('Uom').load().forEach(function(uom){
    $vm.units[uom.uuid] = uom.name;
  })

  $vm.states = {};
  $client.from('Workflow')
    .select({code: 'CustomerOrder'})
    .load()[0].state.forEach(function(state){
      $vm.states[state.name] = state.uuid;
    })

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

function extendApi() {
  $api.getOrder = function(uuid, callback) {
    $api.companyData.getPart('ordersList', uuid, callback);
  }

  $api.getOrdersList = function(callback) {
    $api.companyData.get('ordersList', function(error, data){
      $api.log('data received from server');
      callback(error, data);
      $api.getOrdersList = function(callback) {
        callback(error, data);
      }
    });
  }

  $api.setOrder = function(uuid, data, callback) {
    $api.companyData.setPart('ordersList', uuid, data, callback);
  }
}

function onStart(_taistApi) {

  $.extend($api, _taistApi);
  window.$api = $api;

  extendApi();

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

      $api.companyData.setCompanyKey($vm.companyUuid);
      $api.companyData.get('taistOptions', onCompanyDataLoaded);

      $vm.parseOrderAttributes = require('./processors/parseOrderAttributes');
    });
  });
}

module.exports = onStart
