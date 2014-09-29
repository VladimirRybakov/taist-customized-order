var $vm     = require('../globals/vm'),
    $api    = require('../globals/api'),
    $client = require('../globals/client');

module.exports = function() {
  $api.log('onNewCustomerOrder', $vm.basePlan());

  var i, l,
      materials = $vm.basePlan().data.material,
      posinionsQuantity = materials.length,
      uuid,
      quantities = {},
      goods, good;
      positions = []

  var ts = new Date().getTime()

  goods = require('../dataProvider').getProcessingPlanGoods( $vm.basePlan().uuid );
  $api.log(goods);

  for(i = 0; i < posinionsQuantity; i++) {
    uuid = materials[i].goodUuid;
    quantities[uuid] = materials[i].quantity
  }

  for( i = 0, l = goods.length; i < l; i+= 1 ) {
    good = goods[i];

    positions.push({
      vat: good.vat,
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

  }

  $api.log(positions);

  var order = {
    vatIncluded: true,
    applicable: true,
    sourceStoreUuid: $vm.selectedWarehouse().uuid, // основной склад
    payerVat: true,
    // sourceAgentUuid: "", // контрагент
    targetAgentUuid: $vm.selectedCompany().uuid, // моя компания
    moment: new Date(),
    // name: new Date().getTime().toString(),
    customerOrderPosition: positions,
    employeeUuid: $vm.employeeUuid,
  }

  $client.save("moysklad.customerOrder", order, function(dummy, order){
    $api.companyData.set(order.uuid, {
      uuid: order.uuid,
      name: '',
      customName: '',
      baseTemplate: $vm.basePlan().data.uuid,
      orderTemplate: '',
      presentsCount: 10,
    }, function(error){
      location.hash = '#customerorder/edit?id=' + order.uuid;
    })
  });
}
