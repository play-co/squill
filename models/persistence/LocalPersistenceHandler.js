"use import";

import .BasicPersistenceHandler as BasicPersistenceHandler;

var LocalPersistenceHandler = exports = Class(BasicPersistenceHandler, function(supr) {	
	this.init = function(opts) {
		supr(this, 'init', arguments);

		this._storageKey = opts.storageKey;
		this._key = opts.key;

		this.clear();
	};

	this.load = function() {
		var data = localStorage.getItem(this._storageKey) || '{}',
			key = this._key,
			i;

		this._data = JSON.parse(data);
		data = [];
		for (i in this._data) {
			if (this._data[i]) {
				data.push(this._data[i]);
			}
		}

		return data;
	};

	this.clear = function() {
		this._data = {};
	};

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

	this.commit = function() {
		localStorage.setItem(this._storageKey, JSON.stringify(this._data));
	};
});
