var $vm     = require('../globals/vm'),
    $api    = require('../globals/api'),
    $client = require('../globals/client');

module.exports = function() {
  $api.log('onNewCustomerOrder', $vm.basePlan());

  var i, l,
      uuid,
      goods,
      positions;

  var ts = new Date().getTime()

  goods = require('../dataProvider').getProcessingPlanGoods( $vm.basePlan().uuid );
  $api.log(goods);

  positions = require('../processors').createPositionsByGoods( goods, $vm.basePlan().materials );
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
