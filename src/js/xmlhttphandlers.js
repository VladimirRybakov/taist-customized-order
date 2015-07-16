var $app    = require('./globals/app'),
    $api    = require('./globals/api'),
    $client = require('./globals/client'),
    STATE   = require('./state');



module.exports = {
  'CommonService.getItemTO': function(requestData, responseText){
    var state = $app.getLastState(), tmp;
    if(!state
      ||
        state.name !== STATE.ORDER.newGoodWaited
        && state.name !== STATE.ORDER.newGoodSelected )
    {
      return false;
    }

    // var pattern = /"(Good)",.+,"([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})"\]/,
    //     matches = responseText.match(pattern);
    // if(!matches) {
    //   pattern = /"([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})","[^"]+","(Good)"/,
    //   matches = responseText.match(pattern);
    //   if(matches) {
    //     tmp = matches[2];
    //     matches[2] = matches[1];
    //     matches[1] = tmp;
    //   }
    // }

    var requestUuids = responseText.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g)
    var addedGood = $client.from('Good')
        .select( { uuid: requestUuids.reduce (function(str, uuid){return str + ";uuid=" + uuid}, "0") } )
        .load()[0]

    console.log(addedGood);

    if(addedGood) {
      $app.changeState(STATE.ORDER.newGoodSelected, {
        uuid: addedGood.uuid,
        name: addedGood.name,
        type: 'Good'
      });
    }
  },

  'ConsignmentService.getGoodConsignmentList': function(requestData, responseText){
  },

  'OrderService.stockForConsignmentsWithReserve': function(requestData, responseText){
    var state = $app.getLastState();
    if(!state || state.name !== STATE.ORDER.newGoodSelected) {
      return false;
    }

    $client.load(state.data.type, state.data.uuid, function(dummy, good){
      console.log('!!!', good);

      if(!$vm.goods[good.uuid]) {
        $vm.goods[good.uuid] = wrapGood(good);
      }

      var buyPrice = good.buyPrice || 0
      var priceObject = {
        sum: buyPrice,
        sumInCurrency: buyPrice
      }

      var minPrice = good.minPrice || 0
      var minPriceObject = {
        sum: minPrice,
        sumInCurrency: minPrice
      };

      var position = require('./processors').createCustomerOrderPosition({
        data: {
          vat: good.vat,
          goodUuid: good.uuid,
          quantity: 1,
          discount: 0,
          reserve: 0,
          basePrice: minPriceObject,
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

      order.customerOrderPosition.push(position);
      $app.changeState(STATE.ORDER.newGoodWaited, {});
    });
  },

}
