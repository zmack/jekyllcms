'use strict';

Q.longStackSupport = true;

function assert(cond) {
  if(! cond) {
    throw "assertion failed";
  }
}

function modal(component) {
  var node = document.querySelector('#modal');
  React.unmountComponentAtNode(node);
  React.render(component, node);
  $('.modal', node).modal();
}

function encode_utf8(s) {
  return unescape(encodeURIComponent(s));
}

function decode_utf8(s) {
  return decodeURIComponent(escape(s));
}

function errorHandler(action) {
  return function(e) {
    var message = "Error while " + action;

    if(e.readyState !== null) { // ajax error
      var cause = (e.responseJSON && e.responseJSON.message);
      if(cause) {
        message = message + ": " + cause;
      }
    }

    reportError(message);
  }
}

function reportError(message) {
  app.errorBox.report(message);
}
