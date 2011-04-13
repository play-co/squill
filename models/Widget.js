"use import";

import lib.PubSub;

exports = Class(lib.PubSub, function() {
	this.init = function(params) {
		this._params = params;
		this._view = params.view;
	}
});