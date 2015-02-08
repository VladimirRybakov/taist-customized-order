React = require 'react'

{ div, a, span, button, img } = React.DOM

progressIndicator = 'data:image/gif;base64,R0lGODlhHgAPAJEDAMbGxl5eXujo6P///yH/C05FVFNDQVBFMi4wAwEAAAAh+QQJCgADACwAAAAAHgAPAAACOpyPqcvtD6MBdNZBgdX4JiBwoBhOJXZ+52iS7sKir9zC6z3Hao7XSgzs0X7C4OxzyWyWHY7kCY1KIQUAIfkECQoAAwAsAAAAAB4ADwAAAiOcj6nL7RzimyiAQLPFee7uXeDzjU1pLmiarOzhvkPEyfZNFQAh+QQJCgADACwAAAAAHgAPAAACMpyPqcvtb4KEDtgIAm1AAKxtS/cNQSaOHpgqJNsir4nGx3yG9oDXu1XK7RYS3fCIdBQAACH5BAkKAAMALAAAAAAeAA8AAAI5nI+py+2/goQJWGOBCSBQBAjaEI6c92GianYpCw/nS651i6ZlPL/7vXH5bL+e7kJCGmmRCfMJfRUAACH5BAkKAAMALAAAAAAeAA8AAAI+nI+py+0Pg4SgmgquHQEEKmQDEF4l54EiuZ7d97BmK77qjKOwI49nb4v9hrWUkJYL8jYYTXEHiUyi1KrVUQAAIfkEBQoAAwAsAAAAAB4ADwAAAkacj6nL7Q9TmAtYYwG+I5sABJWgdSR2miUoKkD6ljG6hqMM53WbzCoNHLBuQZ9v6NIVU8ie8gdtIjwdDpUqjTgmPK33+y0AADs='

ordersList = React.createFactory React.createClass
  getInitialState: ->
    status: ''
    isListVisible: false

  toggleList: ->
    @setState { isListVisible: !@state.isListVisible }
    unless @props.orders.length
      @setState { status: 'ЗАГРУЗКА СПИСКА ПОДАРКОВ' }
      @props.actions.loadOrders()

  getInlineStyle: (width) ->
    display: 'inline-block'
    width: width
    overflow: 'hidden'

  makeOrderLink: (order) ->
    a {
      href: "https://online.moysklad.ru/app/#customerorder/edit?id=#{order.msOrder.uuid}"
      style: @getInlineStyle 400
    }, @getOrderName order

  getOrderName: (order) ->
    order.taistOrder.customName or order.taistOrder.name

  render: ->
    div {
      style:
        position: 'absolute'
        top: -16
        bottom: 0
        width: '100%'
        zIndex: 1024
    },
      div { style: textAlign: 'right' },
        a { onClick: @toggleList, style: cursor: 'pointer' }, 'Показать список НОВЫХ ПОДАРКОВ'
      if @state.isListVisible
        div {
          style:
            backgroundColor: 'white'
            marginTop: 8
            border: '1px solid silver'
            padding: 8
        },
          div { style: marginBottom: 8 }, 'НОВЫЕ ПОДАРКИ ',
            span {},
              img { style: { margin: "0px 8px" }, src: progressIndicator }
            span {}, @state.status
          div { style: height: 300, overflowY: 'scroll' },
            @props.orders.map (order) =>
              div { key: order.msOrder.uuid, style: { padding: 6, borderBottom: '1px solid silver' } },
                @makeOrderLink order
                div { style: @getInlineStyle 200 }, 'DIV'

module.exports = ordersList
