var $api = require('../globals/api'),
    $client = require('../globals/client'),
    $vm = require('../globals/vm');

module.exports = function() {
  var $log = $api.log;
  $log('onSaveOrder');

  var i, l,
      plan,
      m,
      materials = [],
      products = [],
      templateUuid = $vm.selectedOrder()._template(),
      saveOrder = function(templateUuid){
        var order = ko.mapping.toJS($vm.selectedOrder),
            mapping = {
              //'_company',
              //'_customer',
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
          if(key == '_project'){
            val = val.replace(/\s+\[.+?\]/, '');
          }
          mapObject = mapping[key];

          if(val !== '') {
            uuid = ($client.from(mapObject.collection)
              .select({name: val})
              .load()[0] || {}).uuid;
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


        order.stateUuid = $vm.states[$vm.selectedOrder()._state()];

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

          [ 'Interest', 'Tax', 'Output', 'Package', 'Risk'].forEach(function(param){
              param = 'primeCost' + param;
              data[param] = parseFloat( vmOrder[param]() );
          });

          $api.companyData.set(order.uuid, data, function(error){
            location.reload();
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
            quantity: parseFloat(m._quantityPerPresent()),
            readMode: "ALL",
          });
        }
        return materials;
      };

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

  if(templateUuid === '') {
    plan.material = [];
    products = plan.product;
    plan.product = [];
    delete(plan.uuid);
    delete(plan.updated);

    $log("savePlan", plan);
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
