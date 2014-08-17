var $app = require('../globals/app'),
    $api = require('../globals/api'),
    STATE = require('../state');

module.exports = function() {
  var hash = location.hash;

  if($app.getFirstState() && $('.b-lognex-dialog-box.b-message-box').size() > 0) {
    $('.b-popup-button', '.b-lognex-dialog-box.b-message-box')
      .click(function(){
        $api.log('CHANGES MESSAGE');
      });
  }

  $app.resetState();

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
