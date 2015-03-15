var $api = require('../globals/api'),
    $client = require('../globals/client'),
    $vm = require('../globals/vm');

module.exports = function(templateUuid, createOrderCopy){
  var order = ko.mapping.toJS($vm.selectedOrder),
      mapping = {
        //'_company',
        '_customer' : { collection: 'Company', saveAs: 'sourceAgentUuid' },
        '_employee' : { collection: 'Employee', saveAs: 'employeeUuid' },
        //'_store',
        '_contract' : { collection: 'Contract', saveAs: 'contractUuid' },
        //'_date',
        '_project'  : { collection: 'Project', saveAs: 'projectUuid' },
      },
      key,
      mapObject,
      val,
      uuid;

  for(key in mapping) {
    val = $vm.selectedOrder()[key]();
    if(key == '_project' || key == '_contract'){
      val = val.replace(/\s+\[.+?\]/, '');
    }
    mapObject = mapping[key];

    if(val !== '') {
      uuid = require('../dictsProvider').get(mapObject.collection, val);
      if(uuid) {
        order[mapObject.saveAs] = uuid;
        $api.log('getAttrUuid', key, val, mapObject.saveAs, uuid);
        continue;
      }
    }

    delete(order[mapObject.saveAs])
  }

  var attrs = $vm.orderAttributes,
      attrValue;
      order.attribute = [];

  for(i = 0, l = attrs.length; i < l; i += 1) {

    uuid = attrs[i].uuid;
    $api.log('CustomAttribute', uuid, attrValue);
    attrValue = $vm.selectedOrder()['$' + uuid]();

    switch(attrs[i].attrType){
      case 'TEXT':
        order.attribute.push({
          TYPE_NAME: "moysklad.operationAttributeValue",
          metadataUuid: uuid,
          valueText: attrValue,
        });
        break;

      case 'STRING':
        order.attribute.push({
          TYPE_NAME: "moysklad.operationAttributeValue",
          metadataUuid: uuid,
          valueString: attrValue,
        });
        break;

      case 'LONG':
        if(attrValue) {
          order.attribute.push({
            TYPE_NAME: "moysklad.operationAttributeValue",
            metadataUuid: uuid,
            longValue: parseInt(attrValue || 0, 10),
          });
        }
        break;

      case 'BOOLEAN':
        order.attribute.push({
          TYPE_NAME: "moysklad.operationAttributeValue",
          metadataUuid: uuid,
          booleanValue: attrValue,
        });
        break;

      case 'ID_CUSTOM':
        order.attribute.push({
          TYPE_NAME: "moysklad.operationAttributeValue",
          metadataUuid: uuid,
          entityValueUuid: $vm.attrDicts[attrs[i].dictionaryMetadataUuid][attrValue],
        });
    }
  }

  order.stateUuid = require('../dictsProvider').get('states', $vm.selectedOrder()._state())
  order.sourceStoreUuid = $vm.selectedWarehouse().uuid;
  order.targetAgentUuid = $vm.selectedCompany().uuid;

  order.sourceAccountUuid = order.sourceAgentUuid

  delete order.targetAccountUuid;

  if(createOrderCopy === true) {
    console.log('Try to create order copy');
    order.customerOrderPosition.forEach( function(pos){
      delete pos.uuid
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

      [ 'Interest', 'Tax', 'Output', 'Package', 'Risk', 'FixedPrice'].forEach(function(param){
        param = 'primeCost' + param;
        data[param] = parseFloat( vmOrder[param]() );
      });

      $api.setOrder(order.uuid, data, function(error){
        location.hash = '#customerorder/edit?id=' + order.uuid
        location.reload()
      })
    });
  }, 1000);
}
