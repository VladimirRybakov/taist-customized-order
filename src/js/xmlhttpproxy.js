var $api = require("./globals/api");

var XMLHttpRequestSend = XMLHttpRequest.prototype.send;
var XMLHttpRequestOpen = XMLHttpRequest.prototype.open;

var msApiQueue = [],
    msApiTimer = null,
    msApiTimeout = 200,
    now = function() { return new Date().getTime(); }
    sendMSRequest = function(request, args) {
      if(!request._isAsync) {
        return XMLHttpRequestSend.apply(request, args);
      }

      if(request) {
        console.log("ADD TO QUEUE", request._url);
        msApiQueue.push({request: request, args: args, ts: now()})
      }

      msApiTimer = setTimeout(function() {
        requestData = msApiQueue.shift();
        console.log("ADD TO QUEUE", requestData.request._url, now() - requestData.ts);
        XMLHttpRequestSend.apply(requestData.request, requestData.args);
      }, msApiTimeout);

    }

var registerXMLHttpHandlers = function (handlers) {

  XMLHttpRequest.prototype.open = function (method, url, isAsync) {
    this._method = method;
    this._url = url;
    this._isAsync = isAsync;
    return XMLHttpRequestOpen.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function() {
    var onReady = this.onreadystatechange,
        ts = new Date().getTime(),
        self = this;

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
                // $api.log('REQUEST', service, method, self.responseText);
              }
            }
          }
        }
      }
      onReady && onReady.apply(self, arguments);
    }

    XMLHttpRequestSend.apply(this, arguments);
    // if(this._url.match(/online\.moysklad\.ru\/exchange\/rest\/ms\/xml/)) {
    //   sendMSRequest(this, arguments);
    // }
    // else {
    //   XMLHttpRequestSend.apply(this, arguments);
    // }
  }
};

module.exports = {
  registerHandlers: registerXMLHttpHandlers
};
