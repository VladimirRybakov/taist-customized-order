React = require 'react'

{ div, table, tbody, thead, tr, th, td, input, span } = React.DOM

PrimeCostCalculation = React.createFactory React.createClass
  getInitialState: ->
    presentsCount: @props.calcData.presentsCount
    discount: @props.calcData.discount

  columnStyle:
    padding: '6px 16px'
    textAlign: 'right'

  calculatePrice: () ->
    if @props.calcData.fixedPrice
      orderSum = parseFloat @props.calcData.fixedPrice
    else
      orderSum = ( @props.pricePerPresent + @props.order.primeCostPackage ) *
      ( 1 + @props.order.primeCostRisk / 100 ) *
      ( 1 + 1 * @props.order.primeCostInterest ) *
      ( 1 + 1 * @props.order.primeCostTax ) *
      ( 1 - @state.discount / 100 )

    orderSum.toFixed(2)

  calculateIncome: () ->
    orderIncome = @calculatePrice() * @props.order.primeCostOutput -
    ( @props.pricePerPresent + @props.order.primeCostPackage ) *
    ( 1 + @props.order.primeCostRisk / 100 )

    orderIncome.toFixed(2)

  calculateTotal: () ->
    count = if @props.calcData.onDiscountUpdate?
      @props.calcData.presentsCount
    else
      @state.presentsCount

    (@calculateIncome() * count).toFixed(2)

  onChangeDiscount: () ->
    @setState discount: event.target.value
    @props.calcData.onDiscountUpdate?(event.target.value)

  onChangePresentsCount: () ->
    @setState presentsCount: event.target.value

  render: ->
    tr { style: borderBottom: '1px solid silver' },
      if @props.calcData.isFixedPrice
        td { colSpan: 2, style: padding: '6px 16px' }, 'Фиксированная цена'

      unless @props.calcData.isFixedPrice
        td { style: @columnStyle },
          if @props.calcData.onDiscountUpdate?
            span { style: fontWeight: 'bold' }, @props.calcData.presentsCount
          else
            input {
              value: @state.presentsCount
              onChange: @onChangePresentsCount
              style:
                textAlign: 'right'
                width: 40
            }

      unless @props.calcData.isFixedPrice
        td { style: @columnStyle },
          input {
            value: if @props.calcData.onDiscountUpdate? then @props.calcData.discount else @state.discount
            onChange: @onChangeDiscount
            style:
              textAlign: 'right'
              width: 40
          }

      td { style: @columnStyle }, @calculatePrice()
      td { style: @columnStyle }, @calculateIncome()
      td { style: @columnStyle }, @calculateTotal()

OrderPrimeCost = React.createFactory React.createClass
  getInitialState: ->
    {}

  primeCostFields: [
    { name: 'Interest', title: 'Процент' }
    { name: 'Tax', title: 'Налог' }
    { name: 'Output', title: 'Выдача' }
    { name: 'Package', title: 'Транспортная упаковка' }
    { name: 'Risk', title: 'Риски (% от суммы)' }
    { name: 'FixedPrice', title: 'Фиксированная цена' }
  ]

  calcData: [
    { presentsCount: 30, discount: 0 }
    { presentsCount: 100, discount: 7 }
    { presentsCount: 200, discount: 10 }
    { presentsCount: 500, discount: 13 }
  ]

  onChangePrimeCostParam: (event) ->
    @props.onChangePrimeCostParam ( 'primeCost' + event.target.dataset.name ), event.target.value

  getInlineStyle: (width = 80) ->
    display: 'inline-block'
    width: width

  render: ->
    table { style: width: 1000, marginBottom: 8 },
      tbody {},
       tr {},
         td { style: width: '50%' },
          div { style: fontWeight: 'bold' }, 'РАСЧЕТ СЕБЕСТОИМОСТИ'
          div {},
            @primeCostFields.map (field) =>
              div { key: field.name, style: padding: '6px 0' },
                div { style: @getInlineStyle 240 }, field.title
                input {
                  'data-name': field.name
                  onChange: @onChangePrimeCostParam
                  value: @props.order['primeCost' + field.name]
                  style:
                    textAlign: 'right'
                    width: 60
                }
         td {},
          table {},
            thead {},
              tr { style: borderBottom: '1px solid black', color: 'silver' },
                ['Количество','Скидка','Цена','Заработок','Маржа'].map (column) =>
                  th { key: column, style: padding: '8px 16px', fontWeight: 'normal' }, column
            tbody {},
              @calcData
              .concat({
                presentsCount: @props.presentsCount
                discount: @props.order._discount
                onDiscountUpdate: (newValue) =>
                  @props.onChangePrimeCostParam '_discount', newValue
              })
              .concat({
                presentsCount: @props.presentsCount
                discount: @props.order._discount
                isFixedPrice: true
                fixedPrice: @props.order.primeCostFixedPrice
              })
              .map (data) =>
                PrimeCostCalculation
                  calcData: data
                  order: @props.order
                  pricePerPresent: @props.pricePerPresent

module.exports = OrderPrimeCost
