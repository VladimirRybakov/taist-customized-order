var $vm     = require('../globals/vm'),
    $api    = require('../globals/api'),
    $client = require('../globals/client');

module.exports = function(){
  var i, l, pos;

  var goods = require('../dataProvider').getProcessingPlanGoods($vm.basePlanForOrder().uuid);
  $api.log(goods);

  var positions = require('../processors').createPositionsByGoods(goods, $vm.basePlanForOrder().materials);
  $api.log(positions);

  // $vm.selectedPlan($vm.basePlanForOrder());
  // for(i = 0, l = positions.length; i < l; i += 1) {
  //   pos = require('../processors').createCustomerOrderPosition({data: positions[i]});
  //   $api.log(pos);
  // }
  var uuid = location.hash.match(/id=(.+)/)[1];

  var order = $client.from('CustomerOrder').select({uuid: uuid}).load()[0];

  if(!order.customerOrderPosition){
    order.customerOrderPosition = [];
  }

  for(i = 0, l = positions.length; i < l; i += 1) {
    order.customerOrderPosition.push(positions[i]);
  }

  $api.log(order);

  //TODO Should be refactored
  $client.save("moysklad.customerOrder", order, function(dummy, order){
    $api.log($vm.basePlanForOrder().data.uuid);
    $api.companyData.set(order.uuid, {
      uuid: order.uuid,
      name: '',
      customName: '',
      baseTemplate: $vm.basePlanForOrder().data.uuid,
      orderTemplate: '',
      presentsCount: 10,
    }, function(error){
      location.reload();
    })
  });
}
