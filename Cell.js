jsio('import .Widget');

var Cell = exports = Class(Widget, function() {
	this.setData = function(data) { this._data = data; }
	this.getData = function() { return this._data; }
	this.setParent = function(parent) { this._parent = parent; }
});
