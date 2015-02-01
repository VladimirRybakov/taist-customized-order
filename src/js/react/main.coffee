module.exports =
  render: (containerId) ->
    console.log 'start react render'
    React = require('react')
    OrdersList = require './ordersList'
    React.render (OrdersList {}), document.getElementById containerId
