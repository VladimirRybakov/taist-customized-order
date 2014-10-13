var elementsCallbacks = [];

function runListener(){
  var i, elem;

  for(i in elementsCallbacks) {
    elem = $(i);
    if(elem.size() > 0) {
      elementsCallbacks[i]();
      delete elementsCallbacks[i];
    }
  }

  for(i in elementsCallbacks) {
    setTimeout(runListener, 200);
    return;
  }
}

module.exports = function(selector, callback) {
  elementsCallbacks[selector] = callback;
  runListener();
}
