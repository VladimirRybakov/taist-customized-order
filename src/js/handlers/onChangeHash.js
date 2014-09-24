var $app = require('../globals/app'),
    $api = require('../globals/api'),
    STATE = require('../state');

module.exports = function() {
  var hash = location.hash,
      isCancelled = ($app.getLastState() || {}).name === 'orderClosingCanceled';

  if($app.getFirstState() && $('.b-lognex-dialog-box.b-message-box').size() > 0) {
    return require('../handlers').onChangesDialog()
  }

  $app.resetState();

  if(/#customerorder(\?global_stateFilter.+)?$/.test(hash)) {
    $('#onCustomerOrder').show();
    return require('../handlers').onCustomerOrder();
  }
  else {
    $('#onCustomerOrder').hide();
  }

  if(/#customerorder\/edit/.test(hash)){
    $api.log('###', 'onEditCustomerOrder');
    $app.changeState(STATE.APP.orderOpened);
    $('body').addClass('newOrderInterface');
    if(isCancelled) {
      return false
    }
    else {
      return require('../handlers').onEditCustomerOrder();
    }
  }
  else {
    $api.log('###', 'simpleInterface');
    $('body').removeClass('newOrderInterface');
  }
}
