var globals = {
  api: {},
  app: {},
  client: {},
  log: function(){},
}

module.exports = {
  set: function(key, val) {
    globals[key] = val
  },

  app: function(){
    return globals.app;
  },

  client: function() {
    return globals.client;
  },

  log: globals.log,
}
