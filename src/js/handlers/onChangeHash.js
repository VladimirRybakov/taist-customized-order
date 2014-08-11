var $app = require('../globals/app'),
    STATE = require('../state');

module.exports = function() {
  var hash = location.hash;

  $state = [];

  if(/#customerorder$/.test(hash)){
    $('#onCustomerOrder').show();
    return require('../handlers').onCustomerOrder();
  }
  else{
    $('#onCustomerOrder').hide();
  }

  if(/#customerorder\/edit/.test(hash)){

    $app.changeState(STATE.APP.orderOpened);
    $('#site').addClass('newOrderInterface');
    return require('../handlers').onEditCustomerOrder();
  }
  else{
    $('#site').removeClass('newOrderInterface');
  }
}
