"use import";

import lib.PubSub as PubSub;

/**
 * @extends lib.PubSub
 */
var BasicDataSource = exports = Class(PubSub, function(supr) {
	this.init = function(opts) {
		supr(this, 'init', arguments);

		this._key = opts.key;
		this._channel = opts.channel;
		this._hasRemote = opts.hasRemote;

this.key = opts.key; // This property should NOT be public!
	};

	this.getKey = function() {
		return this._key;
	};
});