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
        name: plan.name
      });
    }
  }

  function onCustomerOrder() {

    $log('onCustomerOrder');
    $api.wait.elementRender('.pump-title-panel', function(){

      var container = $('>tbody', '.pump-title-panel'),
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
          .click(function(){
            location.hash = '#customerorder/edit?new';
            originalButton.click();
            $log('onClick', $vm.selectedPlan());
          });

      }

      processingPlan = $client.from('ProcessingPlan').count(1000).load();
      parseProcessingPlans(processingPlan);

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

      $api.hash.when(/^.customerorder/, onCustomerOrder);
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