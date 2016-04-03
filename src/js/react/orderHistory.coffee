React = require 'react'

api = require '../globals/api'
vm = require '../globals/vm'

{ div, button, table, tbody, tr, td } = React.DOM

OrderHistory = React.createFactory React.createClass
  getInitialState: ->
    history: []
    selectedRecordId: 0

  componentWillReceiveProps: (newProps) ->
    console.log newProps.uuid, @props.uuid
    unless newProps.uuid is @props.uuid
      @setState
        history: []
        selectedRecordId: 0

  onLoadHistory: ->
    key = "history.#{@props.uuid}"
    api.companyData.get key, (error, historyData) =>
      unless error
        history = for id, data of historyData
          { id: parseInt(id, 10), data }
        @setState { history }

  onSelectHistoryRecord: (id) ->
    @setState selectedRecordId: id

  onHideHistory: () ->
    @setState history: []

  render: ->
    div { style: { display: 'none' } },
      button { onClick: @onLoadHistory, style: padding: 4 }, 'Загрузить историю изменения заказа'
      div { style: padding: 4 },
        if @state.history.length > 1
          button { key: 'button', onClick: @onHideHistory, style: padding: 4, margin: 4 }, 'Скрыть историю изменения заказа'
        @state.history.map (record) =>
          recordDate = new Date record.id
          div { key: record.id, style: padding: 4, border: '1px solid silver', marginBottom: 2, cursor: 'pointer' },
            div { onClick: => @onSelectHistoryRecord(record.id) }, "#{recordDate}"
            if record.id is @state.selectedRecordId
              div { style: padding: 4 },
                table {},
                  tbody {},
                    record.data.customerOrderPosition.map (position) ->
                      tr { key: position.uuid, style: borderBottom: '1px solid silver' },
                        td { style: padding: 4 }, vm.goods[position.goodUuid]?.name?() or position.goodUuid
                        td { style: padding: 4, textAlign: 'right' }, (position.price.sum / 100).toFixed(2)
                        td { style: padding: 4, textAlign: 'right' }, position.quantity

module.exports = OrderHistory
