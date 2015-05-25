var $api = require('../globals/api'),
    $app = require('../globals/app'),
    STATE = require('../state')

module.exports = function(){
  var buttons = $('.b-popup-button', '.b-lognex-dialog-box.b-message-box'),
      yesButton = $(buttons[0]),
      div;

  buttons.css({position: 'relative'});

  div = $("<div>")
    .css({
      position: 'absolute',
      top: -1,
      left: -1,
      overflow: 'hidden',
      width: yesButton.parent().width() + 2 - 10,
      height: yesButton.height() + 2,
    })
    .click(function(event){
        require("../handlers").onSaveOrder();
        return false;
    })
    .prependTo(yesButton);

  buttons.click(function(event){
    var target = event.target,
        action = $(target).text();

    $console.log('USER ACTION', action)

    switch(action){
      case 'Да':
        // Should be handled before
        break;

      case 'Нет':
        // Do nothing
        break;

      case 'Отмена':
        $app.changeState(STATE.APP.orderClosingCanceled);
        break;
    }
  });

  $('.b-close-button', '.b-lognex-dialog-box.b-message-box')
    .click(function(){
      $app.changeState(STATE.APP.orderClosingCanceled);
    });
}
