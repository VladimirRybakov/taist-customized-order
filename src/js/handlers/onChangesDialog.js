var $api = require('../globals/api'),
    $app = require('../globals/app'),
    STATE = require('../state')

module.exports = function(){
  $('.b-popup-button', '.b-lognex-dialog-box.b-message-box')
    .parent()
    .click(function(event){
      var target = event.target,
          action = $(target).text();

      switch(action){
        case 'Да':
        break;

        case 'Нет':
        break;

        case 'Отмена':
          $app.changeState(STATE.APP.orderClosingCanceled);
        break;
      }
    });
}
