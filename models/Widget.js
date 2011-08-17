"use import";

import lib.PubSub;

exports = Class(lib.PubSub, function() {
	this.init = function(opts) {
		this._opts = opts;
		this._view = opts.view;
	}
});