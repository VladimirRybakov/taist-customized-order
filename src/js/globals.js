var globals = {
  app: {},
  log: function(){},
}

module.exports = {
  set: function(key, val) {
    globals[key] = val
  },
  app: globals.app,
  log: globals.log,
}
