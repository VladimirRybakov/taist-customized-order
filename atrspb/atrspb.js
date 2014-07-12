function init() {
  var $api
    , $log
    , $client
    , $vm = {}
    , $div
    , script = document.createElement('script');

  window.$vm = $vm;

  script.src = "https://cdnjs.cloudflare.com/ajax/libs/knockout/3.1.0/knockout-min.js";
  document.head.appendChild(script);

  function parseProcessingPlans(plans) {
    var i
      , l
      , plan;

    for(i = 0, l = plans.length; i < l; i += 1) {
      plan = plans[i];
      $vm.processingPlans.push({
        name: plan.name,
        data: plan
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
          console.log(positions);

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
            location.hash = '#customerorder/edit?id=' + order.uuid;
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
        tr = $('<tr>');
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

      var processingPlans = $client.from('ProcessingPlan').load();
      parseProcessingPlans(processingPlans);

      $('#taist_processingPlans').appendTo(td);
    });

  }

  function waitForKnockout(count, callback){
    if(count > -1) {
      if(typeof(ko) !== 'object') {
        setTimeout(function(){
          waitForKnockout(count - 1, callback);
        }, 50)
      }
      else {
        callback();
      }
    }
  }

  function onStart() {
    $log('onStart');

    waitForKnockout(20, function(){
      var plansDiv;

      $client = require('moysklad-client').createClient();

      //Fixed bug with moysklad-client
      require('xmldom').DOMImplementation = function(){
        this.createDocument = function(){
          return document.implementation.createDocument('', '', null);
        }
        return this;
      }

      $div = $('<div>')
        .css({display: 'none'})
        .prependTo('body');

      plansDiv = $('<div>')
        .attr('data-bind', "foreach: {data: $root.processingPlans, as: 'plan'}");

      $("<div>")
        .attr('data-bind', 'text: plan.name')
        .appendTo(plansDiv);

      $("<select>")
        .attr('id', 'taist_processingPlans')
        .attr('data-bind', "options: processingPlans, optionsText: 'name', value: selectedPlan")
        .css({ width: '100%' })
        .appendTo($div);

      plansDiv.appendTo($div);

      $vm.processingPlans = ko.observableArray([]);
      $vm.selectedPlan = ko.observable(null);

      ko.applyBindings($vm);

      $api.hash.when(/^#customerorder/, onCustomerOrder);
    });
  }

  var addonEntry = {
    start: function(_taistApi, entryPoint) {
      $api = _taistApi;
      $log = $api.log;
      onStart();
    }
  };

  return addonEntry;
}
