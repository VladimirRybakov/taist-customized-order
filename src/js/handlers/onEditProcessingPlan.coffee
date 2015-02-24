api = require '../globals/api'
client = require '../globals/client'

removeBrokenOrder = (orders) ->
  order = orders.pop()
  api.setOrder order.uuid, null, ->
    if orders.length > 0
      removeBrokenOrder orders
    else
      alert 'Ссылки на несуществующие заказы удалены'

module.exports = () ->
  api.getOrdersList (error, data) ->

    uuid = location.hash.match(/id=(.+)/)[1]
    divClass = 'processingplan-related-orders'
    orders = []

    div = $('<div>').addClass(divClass)

    for planUuid, plan of data
      if plan.baseTemplate is uuid or plan.orderTemplate is uuid
        if plan.name isnt ''
          $('<a>')
            .css( {display: 'block', padding: 5, marginLeft: 20} )
            .text( plan.name )
            .attr( 'href', 'https://online.moysklad.ru/app/#customerorder/edit?id=' + plan.uuid )
            .appendTo( div )
          orders.push plan

    if orders.length > 0
      $('<button>')
        .css({ padding: 4, margin: "8px 20px" })
        .text('Удалить ссылки на несуществующие заказы')
        .appendTo(div)
        .click () ->
          client
            .from( 'CustomerOrder' )
            .select( uuid: orders.reduce ( (str, order) -> "#{str};uuid=#{order.uuid}" ), "0" )
            .load (err, realOrders) ->
              realOrdersIds = {}

              realOrders.forEach (order) ->
                realOrdersIds[order.uuid] = true

              ordersToDelete = orders.filter (order) ->
                not realOrdersIds[ order.uuid ]

              if ordersToDelete.length
                removeBrokenOrder(ordersToDelete)
              else
                alert 'Несуществующих заказов не найдено'


      require('../utils').waitForElement '.processingplan-editor-items-editor:first', () ->
        $('.' + divClass).remove()
        div.insertAfter '.processingplan-editor-items-editor:first'
