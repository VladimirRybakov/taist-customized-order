var $api = require("./globals/api");

var registerXMLHttpHandlers = function (handlers) {
  var XMLHttpRequestSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function() {
    var onReady = this.onreadystatechange,
        ts = new Date().getTime(),
        self = this;

    this._request = $.extend(true, {}, this);
    this._arguments = arguments;

    this.onreadystatechange = function(){
      if(self.readyState === 4) {
        var args = self._arguments[0],
            matches,
            service,
            method,
            handlerName;

        if(args) {
          matches = args.match(/com\.lognex\.([\w.]+)?\.([^.|]+)\|([^|]+)/);
          if(matches) {
            service = matches[2];
            method = matches[3];
            if(method !== 'ping' && method !== 'pull') {
              handlerName = service + '.' + method;
              if(handlers && typeof handlers[handlerName] === 'function') {
                handlers[handlerName](args, self.responseText);
              }
              else {
                //$api.log('REQUEST', service, method, self.responseText);
              }
            }
          }
        }
      }
      onReady && onReady.apply(self, arguments);
    }

    XMLHttpRequestSend.apply(this, arguments);
  }
};

module.exports = {
  registerHandlers: registerXMLHttpHandlers
};
