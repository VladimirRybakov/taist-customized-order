var $api = require('../globals/api'),
    $client = require('../globals/client');

module.exports = function() {
  var $log = $api.log;
  $log('onSaveOrder');

  var order = ko.mapping.toJS($vm.selectedOrder),
      i, l,
      plan,
      m,
      materials = [],
      products = [],
      templateUuid = $vm.selectedOrder()._template(),

      saveOrder = function(templateUuid){
        $client.save("moysklad.customerOrder", order, function(dummy, order){
          $log('Order saved');
          $api.companyData.set(order.uuid, {
            uuid: order.uuid,
            name: $vm.selectedOrder()._name(),
            customName: $vm.selectedOrder()._customName(),
            baseTemplate: $vm.basePlan().data.uuid,
            orderTemplate: templateUuid,
            presentsCount: $vm.selectedOrder()._presentsCount(),
          }, function(error){
            location.reload();
            //location.hash = '#customerorder/edit?id=' + order.uuid;
          })
        });
      },

      prepareMaterials = function(plan){
        for(i = 0, l = $vm.selectedOrder().customerOrderPosition().length; i < l; i += 1) {
          m = $vm.selectedOrder().customerOrderPosition()[i];
          materials.push({
            TYPE_NAME: "moysklad.material",
            planUuid: plan.uuid,
            accountId: m.accountId,
            accountUuid: m.accountUuid,
            changeMode: "NONE",
            goodUuid: m.goodUuid(),
            quantity: parseInt(m._quantityPerPresent(), 10),
            readMode: "ALL"
          });
        }
        return materials;
      };

  if($vm.selectedOrder()._customer() == '') {
    alert('Выберите контрагента перед сохранением заказа');
    return false;
  }

  plan = $.extend(true, {}, $vm.selectedPlan().data);
  plan.name = $vm.selectedOrder()._name();
  plan.parentUuid = $vm.orderPlanFolder().uuid;

  if(templateUuid === '') {
    plan.material = [];
    products = plan.product;
    plan.product = [];
    delete(plan.uuid);

    $client.save("moysklad.processingPlan", plan, function(error, plan){

      plan.material = prepareMaterials(plan)

      for(i = 0, l = products.length; i < l; i += 1) {
        products[i].planUuid = plan.uuid;
        delete(products[i].uuid);
      }
      plan.product = products;

      $client.save("moysklad.processingPlan", plan, function(error, plan){
        $log('New plan saved', plan);
        require('../utils').parseProcessingPlans([plan]);
      });

      saveOrder(plan.uuid);
    });
  } else {
      plan.material = prepareMaterials(plan)
      $client.save("moysklad.processingPlan", plan, function(error, plan){
        $log('Plan updated', plan);
        require('../utils').parseProcessingPlans([plan]);
      });
      saveOrder(plan.uuid);
  }
};
