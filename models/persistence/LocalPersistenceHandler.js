"use import";

import .BasicPersistenceHandler as BasicPersistenceHandler;

var LocalPersistenceHandler = exports = Class(BasicPersistenceHandler, function(supr) {	
	this.init = function(opts) {
		supr(this, 'init', arguments);

		this._storageKey = opts.storageKey;
		this._key = opts.key;

		this.clear();
	};

	this.load = function(callback) {
		var dataString = localStorage.getItem(this._storageKey) || '{}',
			data,
			key = this._key,
			i;

		this._data = JSON.parse(dataString);
		data = [];
		for (i in this._data) {
			data.push(this._data[i]);
		}
		// Keep the original...
		this._data = JSON.parse(dataString);

		callback({
			key: key,
			items: data
		});

		this._onLoad && this._onLoad();
	};

	this.commit = function() {
		var data = {},
			i, j;

		for (i in this._data) {
			if (this._data[i]) {
				data[this._data[i][this._key]] = this._data[i];
			}
		}

		localStorage.setItem(this._storageKey, JSON.stringify(data));

		this.publish('CommitFinished');
	};
});
