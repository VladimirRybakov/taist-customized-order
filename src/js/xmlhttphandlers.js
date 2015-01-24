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
          unit: ko.observable( require('./dictsProvider').get('units', good.uomUuid) ),
        };
      }

      var price = good.buyPrice || 0;
      var priceObject = {
        sum: price,
        sumInCurrency: price
      };
      var position = require('./processors').createCustomerOrderPosition({
        data: {
          vat: good.vat,
          goodUuid: good.uuid,
          quantity: 1,
          discount: 0,
          reserve: 0,
          basePrice: priceObject,
          price: priceObject,
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

}
