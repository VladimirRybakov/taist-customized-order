React = require 'react'

{ div } = React.DOM

OrderPrimeCost = require './orderPrimeCost'
OrderHistory = require './orderHistory'

OrderPage = React.createFactory React.createClass
  render: ->
    div {},
      OrderPrimeCost @props.primeCostData
      OrderHistory uuid: @props.primeCostData.orderUuid

module.exports = OrderPage
