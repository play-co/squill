"use import";

import .BasicPersistenceHandler as BasicPersistenceHandler;

var LocalPersistenceHandler = exports = Class(BasicPersistenceHandler, function(supr) {	
	this.init = function(opts) {
		supr(this, 'init', arguments);

		this._storageKey = opts.storageKey;
		this._key = opts.key;
	};

	this.load = function() {
		var data = localStorage.getItem(this._storageKey) || '[]';
		console.log(localStorage);
		this._data = JSON.parse(data);

		return this._data;
	};

	this.clear = function() {
		this._data = [];
	};

	this.update = function(data) {
		var i, j;

		if (isArray(data)) {
			for (i = 0, j = data.length; i < j; i++) {
				this._data[data[i][this._key]] = data[i];
			}
		} else {
			this._data[data[this._key]] = data;
		}
	};

	this.remove = function(data) {
		if (isArray(data)) {
			for (i = 0, j = data.length; i < j; i++) {
				this._data.splice(data[i], 1);
			}
		} else {
			this._data.splice(data, 1);
		}
	};

	this.commit = function() {
		localStorage.setItem(this._storageKey, JSON.stringify(this._data));
	};
});
