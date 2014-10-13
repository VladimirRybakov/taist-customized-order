var $api = require('../globals/api');

module.exports = function() {
  $api.log('onEditProcessingPlan');
  $api.getOrdersList(function(error, data){
    $api.log('onLoadOrderList');
    var uuid = location.hash.match(/id=(.+)/)[1],
        orders = [],
        i, plan,
        divClass = 'processingplan-related-orders',
        div;

    div = $('<div>').addClass(divClass);

    for(i in data) {
      plan = data[i];
      if(plan.baseTemplate === uuid || plan.orderTemplate === uuid) {
        if(plan.name !== '') {
          $('<a>')
            .css({display: 'block', padding: 5, marginLeft: 20})
            .text(plan.name)
            .attr('href', 'https://online.moysklad.ru/app/#customerorder/edit?id=' + plan.uuid)
            .appendTo(div);

          orders.push(data[i]);
        }
      }
    }

    require('../utils').waitForElement('.processingplan-editor-items-editor:first',
      function(){
        $('.' + divClass).remove();
        div.insertAfter('.processingplan-editor-items-editor:first');
      }
    );

    console.log(orders);
  })
}
