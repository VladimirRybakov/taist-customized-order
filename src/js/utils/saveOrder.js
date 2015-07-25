var $api = require('../globals/api'),
    $client = require('../globals/client'),
    $vm = require('../globals/vm');

module.exports = function(templateUuid, createOrderCopy){
  var modifiedOrder = ko.mapping.toJS($vm.selectedOrder),
      key,
      mapObject,
      val,
      uuid;

  // текущий заказ может быть изменен и сохранен с помощью стандартных средств МоегоСклада
  var order = $client.from('CustomerOrder').select({uuid: modifiedOrder.uuid}).load()[0];
  // замена позиции в заказе
  order.customerOrderPosition = modifiedOrder.customerOrderPosition.slice()

  // order.targetAgentUuid = $vm.selectedCompany().uuid;
  // order.sourceAccountUuid = order.sourceAgentUuid
  delete order.targetAccountUuid;

  if(createOrderCopy === true) {
    console.log('Try to create order copy');
    order.customerOrderPosition.forEach( function(pos){
      delete pos.uuid
    });

    order.attribute.forEach( function(attr){
      delete attr.uuid
    });

    delete order.created
    delete order.moment
    delete order.document
    delete order.name
    delete order.uuid
    console.log(order)
  }

  setTimeout(function() {
    $client.save("moysklad.customerOrder", order, function(dummy, order){

      var vmOrder = $vm.selectedOrder(),
      data = {
        uuid: order.uuid,
        name: vmOrder._name(),
        customName: vmOrder._customName(),
        baseTemplate: $vm.basePlan().data.uuid,
        orderTemplate: templateUuid,
        presentsCount: vmOrder._presentsCount(),
        discount: vmOrder._discount(),
        sortOrder: require('../utils').getPositionsOrder(),
      };

      [ 'Interest', 'Interest100', 'Tax', 'Output', 'Package', 'Risk', 'FixedPrice'].forEach(function(param){
        param = 'primeCost' + param;
        data[param] = parseFloat( vmOrder[param]() );
      });

      $api.setOrder(order.uuid, data, function(error){
        location.hash = '#customerorder/edit?id=' + order.uuid
        location.reload()
      })
    });
  }, 500);
}
