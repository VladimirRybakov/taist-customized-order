$vm = require '../globals/vm'
$api = require '../globals/api'
$client = require '../globals/client'

module.exports = (createOrderCopy = false) ->
  if createOrderCopy is true
    goodsSource = $vm.selectedPlan().uuid
    quantitySource = $vm.selectedPlan().materials

  else
    goodsSource = $vm.selectedBasePlan().uuid
    quantitySource = $vm.selectedBasePlan().materials

  goods = require('../dataProvider').getProcessingPlanGoods goodsSource

  positions = require('../processors').createPositionsByGoods goods, quantitySource

  order =
    vatIncluded: true
    applicable: true
    # sourceStoreUuid: $vm.selectedWarehouse().uuid
    payerVat: true
    targetAgentUuid: $vm.selectedCompany().uuid # моя компания
    moment: new Date()
    customerOrderPosition: positions
    employeeUuid: $vm.employeeUuid

  if createOrderCopy is true
    order.sourceAccountUuid = $vm.selectedOrder()?.sourceAccountUuid
    order.sourceAgentUuid = $vm.selectedOrder()?.sourceAgentUuid
    order.projectUuid = $vm.selectedOrder()?.projectUuid?()
    ['sourceAccountUuid', 'sourceAgentUuid', 'projectUuid'].forEach (param) ->
      unless order[param]
        delete order[param]


  $client.save "moysklad.customerOrder", order, (dummy, order) ->
    taistOrder =
      uuid: order.uuid
      name: ''
      customName: ''
      baseTemplate: if createOrderCopy is true then $vm.selectedOrder()._baseTemplate() else $vm.selectedBasePlan().data.uuid
      orderTemplate: ''
      presentsCount: 10

    $api.setOrder order.uuid, taistOrder, (error) ->
      location.hash = '#customerorder/edit?id=' + order.uuid
