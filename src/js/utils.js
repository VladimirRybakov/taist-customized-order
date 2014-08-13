var $vm = require('./globals/vm');

module.exports = {
  parseProcessingPlans: function(plans) {
    var i, l, j, k,
        plan;

    for(i = 0, l = plans.length; i < l; i += 1) {
      plan = plans[i];

      if(plan.material) {
        var materials = {};

        for(j = 0, k = plan.material.length; j < k; j += 1 ) {
          materials[plan.material[j].goodUuid] = plan.material[j].quantity;
        }

        $vm.processingPlans.remove(function(item) {
          return item.uuid === plan.uuid
        });

        $vm.processingPlans.push({
          uuid: plan.uuid,
          name: plan.name,
          data: plan,
          materials: materials,
        });
      }
    }
  }
}
