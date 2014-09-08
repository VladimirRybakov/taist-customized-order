var $api = require('../globals/api'),
    $client = require('../globals/client');

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
        require('../processors/parseOrderAttributes')($vm.selectedOrder());
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
          mapObject = mapping[key];
          if(val !== '') {
            uuid = $client.from(mapObject.collection)
              .select({name: val})
              .load()[0].uuid;
            order[mapObject.saveAs] = uuid;
            $api.log('getAttrUuid', key, val, mapObject.saveAs, uuid);
          }
          else {
            delete(order[mapObject.saveAs])
          }
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

            case 'BOOLEAN':
              order.attribute.push({
                TYPE_NAME: "moysklad.operationAttributeValue",
                metadataUuid: uuid,
                booleanValue: attrValue,
              });
              break;

              //valueString: "70/30"
              // order.attribute.push(
              //   TYPE_NAME: "moysklad.operationAttributeValue",
              //   accountId: "13bc89ab-cd50-11e2-dbdd-001b21d91495",
              //   accountUuid: "13bc89ab-cd50-11e2-dbdd-001b21d91495",
              //   changeMode: "ALL",
              //   entityValueUuid: "56227bb8-ea5e-11e3-8185-002590a28eca",
              //   booleanValue: false
              //   valueText: ''
              //   metadataUuid: "490a5117-ea5f-11e3-0ca4-002590a28eca",
              //   operationUuid: "01abcf18-17e0-11e4-fe3f-002590a28eca",
              //   readMode: "ALL",
              //   updated: Wed Jul 30 2014 15:52:39 GMT+0400 (Russian Standard Time),
              //   updatedBy: "evgenia@atrspb",
              //   uuid: "01ac1314-17e0-11e4-142e-002590a28eca"
              // );
          }

        }


        order.stateUuid = $vm.states[$vm.selectedOrder()._state()];

        $log('#saveOrder', order);

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
            quantity: parseFloat(m._quantityPerPresent()),
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
