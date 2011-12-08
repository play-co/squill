"use import";

import lib.PubSub as PubSub;

var BasicDataSource = exports = Class(PubSub, function(supr) {
	this.init = function(opts) {
		supr(this, 'init', arguments);

		this._key = opts.key;
		this._channel = opts.channel;
		this._hasRemote = opts.hasRemote;

this.key = opts.key;
	};

	this.getKey = function() {
		return this._key;
	};
});