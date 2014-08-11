var $vm     = require('../globals/vm'),
    $api    = require('../globals/api'),
    $client = require('../globals/client');

module.exports = function() {
  $log = $api.log;
  $log('onNewCustomerOrder', $vm.basePlan());
  var i,
      materials = $vm.basePlan().data.material,
      posinionsQuantity = materials.length,
      uuid,
      quantities = {},
      positions = []

  var ts = new Date().getTime()
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
          },
          price: {
            sum: good.salePrice,
            sumInCurrency: good.salePrice
          },
        });

        $log(positions);

        if(positions.length === posinionsQuantity) {

          var order = {
            vatIncluded: true,
            applicable: true,
            sourceStoreUuid: $vm.selectedWarehouse().uuid, // основной склад
            payerVat: true,
            // sourceAgentUuid: "", // контрагент
            targetAgentUuid: $vm.selectedCompany().uuid, // моя компания
            moment: new Date(),
            name: new Date().getTime().toString(),
            customerOrderPosition: positions
          }

          $client.save("moysklad.customerOrder", order, function(dummy, order){
            $api.companyData.set(order.uuid, {
              uuid: order.uuid,
              baseTemplate: $vm.basePlan().data.uuid,
              orderTemplate: '',
              presentsCount: 10,
            }, function(error){
              location.hash = '#customerorder/edit?id=' + order.uuid;
            })
          });
        }

      });

  }
}
