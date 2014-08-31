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
