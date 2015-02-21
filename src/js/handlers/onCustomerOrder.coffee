api = require '../globals/api'

module.exports = () ->
  api.wait.elementRender '.pump-title-panel:visible', () ->
    container = $ '>tbody', '.pump-title-panel:visible'
    td = $ '.taist_container', container

    if td.length is 0
      tr = $ '<tr id="onCustomerOrder">'
      td = $('<td>')
      .addClass('taist_container')
      .attr('colspan', 8)
      .css({ paddingRight: '10px'})
      .appendTo(tr);

      tr.appendTo container

      $('<div id="reactOrdersList">').insertBefore('.lognex-ScreenWrapper');

    $('#onCustomerOrder').show();
    $('#taist_processingPlans').prependTo td

    $('#reactOrdersList').show()
    require('../react/main').render('reactOrdersList')
