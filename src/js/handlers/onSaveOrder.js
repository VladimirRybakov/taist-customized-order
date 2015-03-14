var $api = require('../globals/api'),
    $client = require('../globals/client'),
    $vm = require('../globals/vm');

var prepareMaterials = function(plan){
  for(i = 0, l = $vm.selectedOrder().customerOrderPosition().length; i < l; i += 1) {
    m = $vm.selectedOrder().customerOrderPosition()[i];
    materials.push({
      TYPE_NAME: "moysklad.material",
      planUuid: plan.uuid,
      accountId: m.accountId,
      accountUuid: m.accountUuid,
      changeMode: "NONE",
      goodUuid: m.goodUuid(),
      quantity: parseFloat(m._quantityPerPresent()),
      readMode: "ALL",
    });
  }
  return materials;
}

module.exports = function() {

  var i, l,
      plan,
      m,
      materials = [],
      products = [],
      templateUuid = $vm.selectedOrder()._template(),
      saveOrder = require('../utils').saveOrder;

  require('../processors/parseOrderAttributes')($vm.selectedOrder());

  if($vm.selectedOrder()._customer() == '') {
    alert('Выберите контрагента перед сохранением заказа');
    return false;
  }

  $('#site').hide();
  $('#loading').show();
  plan = $.extend(true, {}, $vm.selectedPlan().data);
  plan.name = $vm.selectedOrder()._name();
  plan.parentUuid = $vm.orderPlanFolder().uuid;

  console.log('before save template', templateUuid);

  if(templateUuid === '') {
    plan.material = [];
    products = plan.product;
    plan.product = [];
    delete(plan.uuid);
    delete(plan.updated);

    $client.save("moysklad.processingPlan", plan, function(error, plan){
      console.log('$client.save', 'moysklad.processingPlan #1')

      plan.material = prepareMaterials(plan)

      for(i = 0, l = products.length; i < l; i += 1) {
        products[i].planUuid = plan.uuid;
        delete(products[i].uuid);
      }
      plan.product = products;

      $client.save("moysklad.processingPlan", plan, function(error, plan){
        console.log('$client.save', 'moysklad.processingPlan #2')
        require('../utils').parseProcessingPlans([plan]);
        setTimeout(function(){ saveOrder(plan.uuid); }, 300);
      });

    });
  } else {
      var operations = $client.from('Processing').select({planUuid: templateUuid}).load(),
          isRelatedPlan = !!operations.length;

      if(!isRelatedPlan) {
        plan.material = prepareMaterials(plan)
        $client.save("moysklad.processingPlan", plan, function(error, plan){
          console.log('$client.save', 'moysklad.processingPlan #3')
          if(error) {
            return
          }
          require('../utils').parseProcessingPlans([plan]);
          setTimeout(function(){ saveOrder(plan.uuid); }, 300);
        });
      }
      else
      {
        setTimeout(function(){ saveOrder(plan.uuid); }, 300);
        // Пользователь не может изменять технологическую карту, но может менять некоторые поля в заказе, например статус
        // alert('Невозможно изменить технологическую карту для которой, создана технологическая операция')
        // location.reload();
      }
  }
};
