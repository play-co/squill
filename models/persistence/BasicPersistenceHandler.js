"use import";

import lib.PubSub as PubSub;

var BasicPersistanceHandler = exports = Class(PubSub, function(supr) {	
	this.init = function(opts) {
		supr(this, 'init', arguments);
	};

	this.load = function() {};
	this.clear = function() {};
	this.update = function(data) {};
	this.remove = function(data) {};
	this.commit = function() {};
});
