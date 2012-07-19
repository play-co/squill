"use import";

import .Widget;

var Cell = exports = Class(Widget, function(supr) {
	this.init = function(params) {
		supr(this, 'init', arguments);
	}
	
	this.setRecycleID = function(id) { this._recycleID = id; }
	this.setResource = function(resource) { this._resource = resource; }

	this.recycle = function() {
		this.publish('Recycle');
		if (this._resource) {
			this._resource.put(this._view, this._recycleID);
		}
	}
});
