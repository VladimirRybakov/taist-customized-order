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

    console.log('getFromDict', dict, name, $vm[dict][name])
    return $vm[dict][name]
  },

  register: function(dictName, updateFunc) {
    console.log('register dictionary', dictName);
    updateFunctions[dictName] = updateFunc
  }
}
