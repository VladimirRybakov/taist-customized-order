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
      # @setState { status: 'ЗАГРУЗКА СПИСКА ПОДАРКОВ' }
      @props.actions.loadOrders()

  getNewPrices: ->
    @props.actions.getNewPrices()

  getInlineStyle: (width, style = {}) ->
    style.display = 'inline-block'
    style.width = width
    style.overflow = 'hidden'
    style

  makeOrderLink: (order) ->
    a {
      href: "https://online.moysklad.ru/app/#customerorder/edit?id=#{order.msOrder.uuid}"
      style: @getInlineStyle 300
    }, @getOrderName order

  getOrderName: (order) ->
    order.taistOrder.customName or order.taistOrder.name

  render: ->
    div {
      style:
        position: 'absolute'
        top: -16
        bottom: 0
        right: 0
        width: '100%'
        zIndex: 512
    },
      div { style: { textAlign: 'right', width: '50%', position: 'absolute', right: 0 } },
        a { onClick: @toggleList, style: cursor: 'pointer' }, 'Показать список НОВЫХ ПОДАРКОВ'
      if @state.isListVisible
        div {
          style:
            backgroundColor: 'white'
            marginTop: 20
            border: '1px solid silver'
            padding: 8
            width: '100%'
        },
          div { style: marginBottom: 12 }, 'НОВЫЕ ПОДАРКИ ',
            button { onClick: @getNewPrices, style: marginLeft: 12 }, 'Расчитать текущие цены'
            # span {},
            #   img { style: { margin: "0px 8px" }, src: progressIndicator }
            # span {}, @state.status
          div { style: height: 200, overflowY: 'scroll' },
            @props.orders.map (order) =>
              style =
                padding: 8
                borderTop: '1px solid silver'
                backgroundColor: if order.diff < 0 then '#fdbcb4' else 'white'

              div { key: order.msOrder.uuid, style: style },
                @makeOrderLink order
                div { style: @getInlineStyle 120, { textAlign: 'right' } }, order.sum
                div { style: @getInlineStyle 120, { textAlign: 'right' } }, order.newSum
                div { style: @getInlineStyle 120, { textAlign: 'right' } }, order.diff

module.exports = ordersList
