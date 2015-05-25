var $vm = require('./globals/vm'),
    $api = require('./globals/api'),

    updateFunctions = {},

    getDictionary = function (dict, name, forceUpdate) {
      $vm[dict] = require('./utils')
      .getFromLocalStorage('dict.' + dict, updateFunctions[dict] || function() {
        console.log('dictsProvider didn\'t find update function for ' + dict);
        return {}
      }, forceUpdate)
    }

module.exports = {
  get: function(dict, name) {

    if(!$vm[dict]){
      getDictionary(dict, name, false);
    }

    if(!$vm[dict][name]){
      getDictionary(dict, name, true);
    }
    
    return $vm[dict][name]
  },

  register: function(dictName, updateFunc) {
    updateFunctions[dictName] = updateFunc
  }
}
