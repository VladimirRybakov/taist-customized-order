var $client = require('../globals/client');

module.exports = function(uuid){
  var plan,
      lazyLoader,
      i, l,
      goods = [];

  plan = $client.from('ProcessingPlan').select({ uuid: uuid }).load()[0];
  if(plan) {
    lazyLoader = $client.createLazyLoader();
    lazyLoader.attach(plan, ['material.good']);
    for(i = 0, l = plan.material.length; i < l; i += 1) {
      goods.push(plan.material[i].good);
    }
  }
  return goods;
}
