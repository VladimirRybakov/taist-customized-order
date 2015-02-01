React = require 'react'

{ div } = React.DOM

ordersList = React.createFactory React.createClass
  render: ->
    div {}, 'List of Orders'

module.exports = ordersList
