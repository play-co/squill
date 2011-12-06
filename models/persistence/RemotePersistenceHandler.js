"use import";

import .BasicPersistenceHandler as BasicPersistenceHandler;

var RemotePersistenceHandler = exports = Class(BasicPersistenceHandler, function(supr) {	
	this.init = function(opts) {
		supr(this, 'init', arguments);
	};
});
