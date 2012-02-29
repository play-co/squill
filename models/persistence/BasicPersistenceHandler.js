"use import";

import lib.PubSub as PubSub;

var BasicPersistanceHandler = exports = Class(PubSub, function(supr) {	
	this.init = function(opts) {
		supr(this, 'init', arguments);

		this._params = opts.params || {}
		this._key = opts.key;
	};

	this.clear = function() {
		this._data = {};
	};

	this.load = function() {};
	this.commit = function() {};

	this.update = function(data) {
		var i, j;

		if (isArray(data)) {
			for (i = 0, j = data.length; i < j; i++) {
				this.update(data[i]);
			}
		} else {
			this._data[data[this._key]] = data;
		}
	};

	this.setSource = function(dataSource) {
		this._dataSource = dataSource;
	}

	this.remove = function(data) {
		var i, j;

		if (isArray(data)) {
			for (i = 0, j = data.length; i < j; i++) {
				delete(this._data[data[i]]);
			}
		} else {
			delete(this._data[data]);
		}
	};

	this.setParams = function(params) {
		this._params = params;
	};

});
