React = require 'react'
OrdersList = require './ordersList'

vm = require '../globals/vm'
client = require '../globals/client'

timeout = 200

calculatePrice = (goodsSum, taistOrder) ->
  orderSum = ( goodsSum + taistOrder.primeCostPackage ) *
  ( 1 + taistOrder.primeCostRisk / 100 ) *
  ( 1 + 1 * taistOrder.primeCostInterest ) *
  ( 1 + 1 * taistOrder.primeCostTax ) / taistOrder.presentsCount

  orderSum.toFixed 2

calculateOrderSum = (msOrder, taistOrder) ->
  goodsSum = msOrder.customerOrderPosition.reduce (sum, pos) ->
    oldGoodPrice = pos.price.sum / 100
    unless data.goodsIndex[pos.goodUuid]
      data.goodsIndex[pos.goodUuid] =
        uuid: pos.goodUuid
        oldPrices: [ oldGoodPrice ]
      data.goods.push data.goodsIndex[pos.goodUuid]
    else
      data.goodsIndex[pos.goodUuid].oldPrices.push oldGoodPrice
    sum + oldGoodPrice * pos.quantity
  , 0

  calculatePrice goodsSum, taistOrder

calculateOrdersSumWithNewPrices = () ->
  for order in data.orders
    goodsSum = order.msOrder.customerOrderPosition.reduce (sum, pos) ->
      newGoodPrice = data.goodsIndex[pos.goodUuid].newPrice
      if typeof newGoodPrice is 'undefined'
        console.log data.goodsIndex[pos.goodUuid]
      sum + (newGoodPrice or 0) * pos.quantity
    , 0
    order.newSum = calculatePrice goodsSum, order.taistOrder
    order.diff = (order.newSum - order.sum).toFixed 2
  render()

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
              sum = calculateOrderSum msOrder, taistOrder
              data.orders.push { msOrder, taistOrder, sum }
              render()
  , timeout

data =
  orders: []
  goods: []
  goodsIndex: {}
  actions: {
    loadOrders
    getNewPrices
  }

container = null
render = () ->
  if container
    React.render (OrdersList data), container

module.exports =
  render: (containerId) ->
    container = document.getElementById containerId
    render()
