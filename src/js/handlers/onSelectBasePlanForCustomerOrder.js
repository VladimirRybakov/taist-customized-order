var $vm     = require('../globals/vm'),
    $api    = require('../globals/api'),
    $client = require('../globals/client');

module.exports = function(){
  var goods = require('../dataProvider').getProcessingPlanGoods($vm.basePlanForOrder().uuid);
  $api.log(goods);
}
