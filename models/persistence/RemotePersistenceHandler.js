"use import";

/**
 * A remark about the implementation of this persistence handler:
 *
 * All data which is initially loaded here is kept and updated, which is
 * actually a duplicate function of the dataSource. This is done to make the 
 * saving to the server as a single chunk of data easy. The commit sends all
 * data to the server.
 *
 * The final version should only send the updates to the server.
**/

import util.ajax;

import .BasicPersistenceHandler as BasicPersistenceHandler;

var RemotePersistenceHandler = exports = Class(BasicPersistenceHandler, function(supr) {	
	this.load = function(callback) {
		if (this._loadURL === null) {
			callback({
				key: this._key,
				items: []
			});

			this._onLoad && this._onLoad();
			return;
		}

		util.ajax.post(
			{
				url: this._loadURL,
				data: this._params
			},
			bind(
				this,
				function(err, response) {
					this._data = JSON.parse(response);
					var data = [];
					for (var i in this._data) {
						data.push(this._data[i]);
					}
					// Keep the original...
					this._data = JSON.parse(response);

					if (err) { 
						//return alert(JSON.stringify(err));
					} else {
						callback({
							key: this._key,
							items: data
						});

						this._onLoad && this._onLoad();
					}
				}
			)
		);
	};

	this.commit = function() {
		if (this._saveURL === null) {
			return;
		}

		var data = {},
			i, j;

		for (i in this._data) {
			if (this._data.hasOwnProperty(i) && (this._data[i][this._key] !== undefined)) {
				data[this._data[i][this._key]] = this._data[i];
			}
		}

		data = merge({data: data}, this._params);
		util.ajax.post(
			{
				url: this._saveURL,
				data: data
			},
			bind(
				this,
				function(err, response) {}
			)
		);
	};
});
