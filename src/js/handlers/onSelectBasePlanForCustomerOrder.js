var $vm     = require('../globals/vm'),
    $api    = require('../globals/api'),
    $client = require('../globals/client');

module.exports = function(){
  var i, l, pos;

  var goods = require('../dataProvider').getProcessingPlanGoods($vm.basePlanForOrder().uuid);

  var positions = require('../processors').createPositionsByGoods(goods, $vm.basePlanForOrder().materials);

  var uuid = location.hash.match(/id=(.+)/)[1];

  var order = $client.from('CustomerOrder').select({uuid: uuid}).load()[0];

  if(!order.customerOrderPosition){
    order.customerOrderPosition = [];
  }

  for(i = 0, l = positions.length; i < l; i += 1) {
    order.customerOrderPosition.push(positions[i]);
  }

  //TODO Should be refactored
  $client.save("moysklad.customerOrder", order, function(dummy, order){
    $api.setOrder(order.uuid, {
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
