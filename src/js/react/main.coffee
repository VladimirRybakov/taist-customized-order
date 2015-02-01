module.exports =
  render: (containerId) ->
    React = require('react')
    OrdersList = require './ordersList'
    React.render (OrdersList {}), document.getElemenById containerId
