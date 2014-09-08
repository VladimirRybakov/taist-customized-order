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

function setupDicts() {
  $vm.companyUuid = $client.from('MyCompany').load()[0].uuid;

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

  $vm.attrDicts = {};
  $vm.orderAttributes = $client
    .from('embeddedEntityMetadata')
    .select({name: 'CustomerOrder'})
    .load()[0].attributeMetadata
    .map(function(attr) {
      if(attr.dictionaryMetadataUuid) {
          $vm.attrDicts[attr.dictionaryMetadataUuid] = {}
          $client
            .from('customEntity')
            .select({entityMetadataUuid: attr.dictionaryMetadataUuid})
            .load().forEach(function(entity){
              $vm.attrDicts[attr.dictionaryMetadataUuid][entity.name] = entity.uuid;
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
}

function onCompanyDataLoaded(error, taistOptions) {
  taistOptions || (taistOptions = {});

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

  $vm.processingPlans = ko.observableArray([]).extend({ rateLimit: 50 });

  $vm.selectedPlan = ko.observable(null);
  $vm.basePlan = ko.observable(null);

  var processingPlans;

  if(typeof taistOptions.processingPlans === 'undefined') {
    processingPlans = $client.from('ProcessingPlan').load();
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

    setupDicts();

    $api.companyData.setCompanyKey($vm.companyUuid);

    $api.userData.get('taistOptions', function(error, taistOptions){
      taistOptions || (taistOptions = {});

      if(taistOptions.moyskladClientUser && taistOptions.moyskladClientUser.length > 0
      && taistOptions.moyskladClientPass && taistOptions.moyskladClientPass.length > 0) {
        $client.setAuth(taistOptions.moyskladClientUser, taistOptions.moyskladClientPass);
      }

      $vm.moyskladClientUser = ko.observable(taistOptions.moyskladClientUser || '');
      $vm.moyskladClientPass = ko.observable(taistOptions.moyskladClientPass || '');

      $api.companyData.get('taistOptions', onCompanyDataLoaded);
    });
  });
}

module.exports = onStart
