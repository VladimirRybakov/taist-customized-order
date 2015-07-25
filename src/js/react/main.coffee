vm = require '../globals/vm'
client = require '../globals/client'

timeout = 200

calculatePrice = (goodsSum, taistOrder, calculateFor100 = false) ->
  primeCostInterest = taistOrder.primeCostInterest
  if calculateFor100
    primeCostInterest = taistOrder.primeCostInterest100 or 1.2

  orderSum = ( goodsSum + taistOrder.primeCostPackage ) *
  ( 1 + taistOrder.primeCostRisk / 100 ) *
  ( 1 + 1 * primeCostInterest ) *
  ( 1 + 1 * taistOrder.primeCostTax ) / taistOrder.presentsCount

  orderSum.toFixed 2

calculateOrderSum = (msOrder, taistOrder) ->

  goodsSum = msOrder.customerOrderPosition.reduce (sum, pos) ->
    unless data.goodsIndex[pos.goodUuid]
      data.goodsIndex[pos.goodUuid] = uuid: pos.goodUuid
      data.goods.push data.goodsIndex[pos.goodUuid]

    price: sum.price + pos.price.sum / 100 * pos.quantity,
    minPrice: sum.minPrice + (taistOrder.minimalPrices?[pos.uuid] or (pos.basePrice.sum / 100)) * pos.quantity

  , { price: 0, minPrice: 0 }

  sum: calculatePrice goodsSum.price, taistOrder, false
  minSum: calculatePrice goodsSum.minPrice, taistOrder, true

calculateOrdersSumWithNewPrices = () ->
  for order in data.orders
    goodsSum = order.msOrder.customerOrderPosition.reduce (sum, pos) ->
      newGoodPrice = data.goodsIndex[pos.goodUuid].newPrice
      minGoodPrice = data.goodsIndex[pos.goodUuid].minPrice
      # if typeof newGoodPrice is 'undefined'
      #   console.log data.goodsIndex[pos.goodUuid]

      price: sum.price + (newGoodPrice or 0) * pos.quantity
      minPrice: sum.minPrice + (minGoodPrice or 0) * pos.quantity

    , { price: 0, minPrice: 0 }

    console.log order, goodsSum

    order.newSum = calculatePrice goodsSum.price, order.taistOrder, false
    order.diff = (order.newSum - order.sum).toFixed 2

    order.newMinSum = calculatePrice goodsSum.minPrice, order.taistOrder, true
    order.minDiff = (order.newMinSum - order.minSum).toFixed 2

  renderOrdersList()

getNewPrices = () ->
  idx = 0
  len = 40
  while (idx * len) < data.goods.length
    goodsPart = data.goods.slice idx * len, (idx + 1) * len
    client
      .from('Good')
      .select( uuid: goodsPart.reduce ((str, good) -> "#{str};uuid=#{good.uuid}"), "0" )
      .load (err, goods) ->
        goods.forEach (good) ->
          data.goodsIndex[good.uuid].newPrice = ( good.buyPrice or 0 ) / 100
          data.goodsIndex[good.uuid].minPrice = ( good.minPrice or 0 ) / 100
          data.goodsIndex[good.uuid].name = good.name
    idx += 1

  calculateOrdersSumWithNewPrices()

loadOrders = () ->
  setTimeout ->
    client
      .from('CustomerOrder')
      .select( stateUuid: 'f848c26b-3996-11e4-a04c-002590a28eca' )
      .load (err, orders) ->
        data.orders = []
        for msOrder in orders
          do (msOrder) ->
            vm.getOrder msOrder.uuid, (err, taistOrder) ->
              { sum, minSum } = calculateOrderSum msOrder, taistOrder
              data.orders.push { msOrder, taistOrder, sum, minSum }
              renderOrdersList()
  , timeout

data =
  orders: []
  goods: []
  goodsIndex: {}
  actions: {
    loadOrders
    getNewPrices
  }

React = require 'react'

OrdersList = require './ordersList'
ordersListContainer = null
renderOrdersList = () ->
  if ordersListContainer
    React.render ( OrdersList data ), ordersListContainer

OrderPage = require './orderPage'
orderPageContainer = null
renderOrderPage = () ->
  if orderPageContainer

    order = {}

    [
      'primeCostInterest'
      'primeCostInterest100'
      'primeCostTax'
      'primeCostOutput'
      'primeCostPackage'
      'primeCostRisk'
      'primeCostFixedPrice'
      '_discount'
    ].map (name) =>
      order[name] = $vm.selectedOrder()[name]?()

    React.render (
      OrderPage {
        primeCostData:
          orderUuid: $vm.selectedOrder().uuid
          order: order
          pricePerPresent: $vm.selectedOrder()._pricePerPresent()
          minPricePerPresent:  $vm.selectedOrder()._minPricePerPresent()
          presentsCount: $vm.selectedOrder()._presentsCount()
          onChangePrimeCostParam: (name, value) ->
            $vm.selectedOrder()[name](value);
            renderOrderPage()
      }
    ), orderPageContainer

module.exports =
  renderOrdersList: (containerId) ->
    ordersListContainer = document.getElementById containerId
    renderOrdersList()

  renderOrderPage: (container) ->
    if container
      orderPageContainer = container
    renderOrderPage()
