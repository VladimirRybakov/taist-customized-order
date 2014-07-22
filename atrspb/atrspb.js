function init() {
  var $api
    , $log
    , $client
    , $vm = {}
    , $div
    , script;

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
        tr = $('<tr id="onCustomerOrder">');
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

  function createSumObject(options) {
    return ko.mapping.fromJS(
      options.data,
      {
        copy: ['TYPE_NAME']
      }
    );
  }

  function createCustomerOrderPosition(options) {
    var koData = ko.mapping.fromJS(options.data, {
      basePrice: createSumObject,
      price: createSumObject,
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
      $client.load('Good', goodUuid, function(dummy, good){
        $vm.goods[good.uuid].name(good.name);
      });
    }

    koData._name = $vm.goods[goodUuid].name;

    koData._price = ko.computed(function(){
      return (this.price.sum()/100).toFixed(2);
    }, koData);

    return koData;
  }

  function onEditCustomerOrder() {
    var uuid = location.hash.match(/id=(.+)/)[1];
    $log('onEditCustomerOrder', uuid);
    $client.load('CustomerOrder', uuid, function(dummy, orderData){
      $vm.customerOrders[uuid] = ko.mapping.fromJS(orderData, {
        sum: {
          create: createSumObject
        },
        customerOrderPosition: {
          create: createCustomerOrderPosition
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
      $vm.currentOrder($vm.customerOrders[uuid]);
    });
  }

  function onChangeHash() {
    var hash = location.hash;
    console.log('onHashChange', hash);

    if(/#customerorder$/.test(hash)){
      $('#onCustomerOrder').show();
      return onCustomerOrder();
    }
    else{
      $('#onCustomerOrder').hide();
    }

    if(/#customerorder\/edit/.test(hash)){
      return onEditCustomerOrder();
    }

  }

  function onStart() {
    $log('onStart');

    waitForKnockout(20, function(){
      $client = require('moysklad-client').createClient();

      //Fixed bug with moysklad-client
      require('xmldom').DOMImplementation = function(){
        this.createDocument = function(){
          return document.implementation.createDocument('', '', null);
        }
        return this;
      }

      $div = $('<div id="taist">')
        // .css({display: 'none'})
        .prependTo('body');

      $("<select>")
        .attr('id', 'taist_processingPlans')
        .attr('data-bind', "options: processingPlans, optionsText: 'name', value: selectedPlan")
        .css({ width: '100%' })
        .appendTo($div);

      $vm.processingPlans = ko.observableArray([]);
      $vm.selectedPlan = ko.observable(null);

      $vm.goods = {}
      $vm.customerOrders = {};
      $vm.currentOrder = ko.observable(null);

      var table  = $('<table border=1 data-bind="if: currentOrder() !== null">'),
          thead  = $('<thead>').appendTo(table),
          trhead = $('<tr>').appendTo(thead),
          tbody  = $('<tbody data-bind="foreach: currentOrder().customerOrderPosition()">').appendTo(table),
          trbody = $('<tr>').appendTo(tbody);

      [
        { title: 'goodUuid', bind: 'text', var: '_name' },
        { title: 'quantity', bind: 'text', var: 'quantity' },
        { title: 'reserve', bind: 'text', var: 'reserve' },
        { title: 'price', bind: 'text', var: '_price' },
        { title: 'vat', bind: 'text', var: 'vat' },
        { title: 'discount', bind: 'text', var: 'discount' },
      ].map(function(item){
        $('<td>').text(item.title).appendTo(trhead);
        $('<td>').attr("data-bind", item.bind + ":" + item.var).appendTo(trbody);
      })

      table.appendTo($div);

// <table border=1>
//   <thead>
//     <tr>
//       <th>goodUuid</th>
//       <th>quantity</th>
//       <th>reserve</th>
//       <th>price</th>
//       <th>vat</th>
//       <th>discount</th>
//     </tr>
//   </thead>
//   <tbody data-bind="foreach: customerOrderPosition">
//     <tr>
//       <td data-bind="text: goodUuid"></td>
//       <td data-bind="text: quantity"></td>
//       <td data-bind="text: reserve"></td>
//       <td data-bind="text: _price"></td>
//       <td data-bind="text: vat"></td>
//       <td data-bind="text: discount"></td>
//     </tr>
//   </tbody>
// </table>

      ko.applyBindings($vm);

      $api.hash.onChange(onChangeHash);
      onChangeHash(location.hash);
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
