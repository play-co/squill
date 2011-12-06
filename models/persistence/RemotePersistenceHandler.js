"use import";

import .BasicPersistanceHandler as BasicPersistanceHandler;

var RemotePersistanceHandler = exports = Class(BasicPersistanceHandler, function(supr) {	
	this.init = function(opts) {
		supr(this, 'init', arguments);
	};
});
