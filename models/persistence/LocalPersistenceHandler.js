"use import";

import .BasicPersistenceHandler as BasicPersistenceHandler;

var LocalPersistenceHandler = exports = Class(BasicPersistenceHandler, function(supr) {	
	this.init = function(opts) {
		supr(this, 'init', arguments);
		
		this._storageKey = opts.storageKey;
	}

	this.load = function(dataSource, cb) {
		var dataStr = localStorage.getItem(this._storageKey);
		if (dataStr) {
			try {
				dataSource.fromJSON(JSON.parse(dataStr));
				return cb && cb();
			} catch(e) {
				return cb && cb({'InvalidJSON': 'local storage may be corrupted'});
			}
		} else {
			return cb && cb({'NoData': true});
		}
	}

	this.save = function(dataSource) {
		localStorage.setItem(this._storageKey, JSON.stringify(dataSource));
	}
});
