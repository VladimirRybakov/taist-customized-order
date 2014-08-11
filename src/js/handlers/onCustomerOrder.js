module.exports = function() {
  var $log = require('../globals/api').log;

  $log('onCustomerOrder');
  $api.wait.elementRender('.pump-title-panel:visible', function(){

    var container = $('>tbody', '.pump-title-panel:visible'),
        td = $('.taist_container', container),
        tr,
        originalButton;

    if(td.length === 0) {
      tr = $('<tr id="onCustomerOrder">');
      td = $('<td>')
        .addClass('taist_container')
        .attr('colspan', 3)
        .css({ paddingRight: '10px'})
        .appendTo(tr);
      tr.appendTo(container);

      originalButton = $($('>tr>td', container)[1]);
      originalButton
        .clone()
        .appendTo(tr)
        .click(require('../handlers').onNewCustomerOrder);
    }

    $('#taist_processingPlans').appendTo(td);
  });

}
