var globals = {
  app: {},
  log: function(){},
}

module.exports = {
  set: function(key, val) {
    globals[key] = val
  },

  app: function(){
    return globals.app;
  },

  log: globals.log,
}
