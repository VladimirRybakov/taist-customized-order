var $api = require('./globals/api')
  , $log
  , $client = require('./globals/client')
  , $vm = require('./globals/vm')
  , $div
  , $goodsDOMNode
  , sctipt
  , handlers = require('./handlers')
  , $app = require('./globals/app')

  , $state = []
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

function onStart(_taistApi) {

  $.extend($api, _taistApi);
  window.$api = $api;

  $log = $api.log;
  $log('onStart');

  waitForKnockout(20, function(){
    $.extend($client, window.require('moysklad-client').createClient());
    $client.setAuth('admin@ntts', '15c316837613');

    var xmlhttphandlers = require("./xmlhttphandlers");
    require("./xmlhttpproxy").registerHandlers( xmlhttphandlers );

    $vm.companyUuid = $client.from('MyCompany').load()[0].uuid;

    $api.companyData.setCompanyKey($vm.companyUuid);

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

      ko.applyBindings($vm, $div[0]);

      var settingsDiv = require('./taistSettingsInterface').create(taistOptions);
      ko.applyBindings($vm, settingsDiv[0]);

      $vm.goods = {}
      $vm.customerOrders = {};
      $vm.selectedOrder  = ko.observable(null);
      $vm.presentsCount  = ko.observable(1);

      $vm.selectedOrderPositions = ko.observableArray([]);

      $goodsDOMNode = $('<div id="taist_allGoods" data-bind="if: selectedOrder() !== null">');
      require('./customOrderInterface').create($goodsDOMNode);
      $goodsDOMNode.appendTo($div);

      $api.hash.onChange(handlers.onChangeHash);
      handlers.onChangeHash(location.hash);
    });
  });
}

module.exports = onStart
