var $api = require('./globals/api'),
    queue = [],
    isInProgress = false;

function process(){
  var l = queue.length,
      request,
      $log = $api.log;

  isInProgress = true;

  if(l > 0) {
    request = queue.shift();
    request.req(function(){
      request.res.apply(null, arguments);
      setTimeout(process, 42 * 5);
    });
  } else {
    isInProgress = false;
  }
}

module.exports = {
  push: function(request){
    queue.push(request);
    if(isInProgress === false) {
      process();
    }
  }
}
