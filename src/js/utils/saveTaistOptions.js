var $api = require('../globals/api'),
    $vm = require('../globals/vm');

module.exports = function() {
  var processingPlans = [];
  $vm.baseProcessingPlans().forEach(function(plan){
    processingPlans.push(plan.data);
  })

  if(processingPlans.length === 0) {
    processingPlans = undefined;
  }

  $api.companyData.set('taistOptions', {
    basePlanFolder:     ($vm.basePlanFolder()     || {}).uuid,
    orderPlanFolder:    ($vm.orderPlanFolder()    || {}).uuid,
    selectedWarehouse:  ($vm.selectedWarehouse()  || {}).uuid,
    selectedCompany:    ($vm.selectedCompany()    || {}).uuid,

    processingPlans:    processingPlans,
    processingPlansFolder: $vm.processingPlanFolders(),

    // moyskladClientUser: $vm.moyskladClientUser(),
    // moyskladClientPass: $vm.moyskladClientPass(),
  }, function(){});

  $api.userData.set('taistOptions', {
    moyskladClientUser: $vm.moyskladClientUser(),
    moyskladClientPass: $vm.moyskladClientPass(),
  }, function(){});
}
