var $app    = require('./globals/app'),
    $log    = require('./globals/api').log,
    $client = require('./globals/client'),
    STATE   = require('./state');

module.exports = {
  'CommonService.getItemTO': function(requestData, responseText){
    $log(requestData, responseText);
    var state = $app.getLastState();
    if(!state || state.name !== STATE.ORDER.newGoodWaited)
    {
      return false;
    }

    var matches = responseText.match(/"Good","([^"]+)","([^"]+)","([^"]+)"\]/);
    if(matches) {
      $app.changeState(STATE.ORDER.newGoodSelected, {
        uuid: matches[3],
        name: matches[2],
      });
    }
  },

  'OrderService.stockForConsignmentsWithReserve': function(requestData, responseText){
    $log(requestData, responseText);
    var state = $app.getLastState();
    if(!state || state.name !== STATE.ORDER.newGoodSelected) {
      return false;
    }

    $log('New position', state.data);
    $client.load('Good', state.data.uuid, function(dummy, good){

      if(!$vm.goods[good.uuid]) {
        $vm.goods[good.uuid] = {
          name: ko.observable(good.name)
        };
      }

      var position = require('./processors').createCustomerOrderPosition({
        data: {
          vat: 18,
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
        this.quantity(quantity);
        return quantity;
      }, position);

      $log(position);
      order.customerOrderPosition.push(position);
    });
  },

  'TagService.getTags': function(requestData, responseText){
    $log(requestData, responseText);
  },

  'ContractService.getContracts': function(requestData, responseText){
    $log(requestData, responseText);
    var state = $app.getFirstState();
    if(!state || state.name !== STATE.APP.orderOpened) {
      return false;
    }

    var pattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/,
        matches = requestData.match(pattern);
    if(matches) {
      $client.load('Company', matches[0], function(dummy, company){
        if(company) {
          var order = $vm.selectedOrder();
          if(order) {
            order.sourceAccountUuid = company.accountUuid;
            order.sourceAgentUuid   = company.uuid;
            order._customer(company.name);
            $log(company);            
          }
        }
      });
    }
  },
}
