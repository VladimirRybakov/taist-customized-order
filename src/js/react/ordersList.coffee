React = require 'react'

{ div, button } = React.DOM

ordersList = React.createFactory React.createClass
  render: ->
    div {},
      button {}, 'Update'

module.exports = ordersList
