exports = Class(function() {
	this.init = function() {
		this._data = {};
	}
	
	this.get = function(key) {
		return this._data[key] && this._data[key].pop();
	}
	
	this.put = function(item, key) {
		(this._data[key] || (this._data[key] = [])).push(item);
	}
});