var $vm = require('./globals/vm'),
    $api = require('./globals/api'),

    updateFunctions = {}

module.exports = {
  get: function(dict, name) {

    if(!$vm[dict] || !$vm[dict][name]){
      $vm[dict] = require('./utils')
        .getFromLocalStorage('dict.' + dict, updateFunctions[dict] || function() {
          console.log('dictsProvider didn\'t find update function for ' + dict);
          return {}
        }, true)
    }

    console.log('getFromDict', dict, name, $vm[dict][name])
    return $vm[dict][name]
  },

  register: function(dict, updateFunc) {
    updateFunctions[dict] = updateFunc
  }
}
