var _wp = 'squill-';
var win = window;
var doc = document;

exports.setTargetWindow = function(w) { win = w; doc = w.document; }
exports.getTargetWindow = function() { return win; }
exports.getTargetDocument= function() { return doc; }

exports.setWidgetPrefix = function(p) { _wp = p; }
exports.getWidgetPrefix = function() { return _wp; }
