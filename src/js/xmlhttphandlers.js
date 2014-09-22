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
          unit: ko.observable($vm.units[good.uomUuid]),
        };
      }

      var position = require('./processors').createCustomerOrderPosition({
        data: {
          vat: good.vat,
          goodUuid: good.uuid,
          quantity: 1,
          discount: 0,
          reserve: 0,
          basePrice: {
            sum: good.salePrice,
            sumInCurrency: good.salePrice
          },
          price: {
            sum: good.salePrice,
            sumInCurrency: good.salePrice
          },
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

  'TagService.getTags': function(requestData, responseText){
    // $api.log(requestData, responseText);
  },

  'ContractService.getContracts': function(requestData, responseText){
    // $api.log(requestData, responseText);
    var state = $app.getFirstState();
    if(!state || state.name !== STATE.APP.orderOpened) {
      return false;
    }

    var pattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g,
        matches = requestData.match(pattern);
    if(matches) {
      var i = 0;
      while(matches[i] == 'e15a38f1-cd54-11e2-42ae-001b21d91495') {
        i++;
      }

      $client.load('Company', matches[i], function(dummy, company){
        if(company) {
          var order = $vm.selectedOrder();
          if(order) {
            order.sourceAccountUuid = company.accountUuid;
            order.sourceAgentUuid   = company.uuid;
            order._customer(company.name);
            // $api.log(company);
          }
        }
      });
    }
  },
}
