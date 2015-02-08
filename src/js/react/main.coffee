React = require 'react'
OrdersList = require './ordersList'

vm = require '../globals/vm'
client = require '../globals/client'

timeout = 200

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
              data.orders.push { msOrder, taistOrder }
              render()
  , timeout

data =
  orders: []
  actions: {
    loadOrders
  }

container = null
render = () ->
  if container
    React.render (OrdersList data), container

module.exports =
  render: (containerId) ->
    container = document.getElementById containerId
    render()
