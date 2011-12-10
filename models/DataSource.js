"use import";

import .BasicDataSource as BasicDataSource;

var DataSource = exports = Class(BasicDataSource, function(supr) {

	var defaults = {
		key: 'id',
		channel: null,
		hasRemote: false
	};

	this.init = function(opts) {
		opts = merge(opts, defaults);

		supr(this, 'init', [opts]);

		this._byIndex = [];
		this._byID = {};

		this.length = 0;
		this._persistenceHandler = opts.persistenceHandler || null;

		if (this._persistenceHandler) {
			this._persistenceHandler.load(
				bind(
					this,
					function(data) {
						this.fromJSON(data);
					}
				)
			);
		}

		if (opts.sorter) {
			this.setSorter(opts.sorter);
		}

		this._changeDataSave = false;
		this._changeData = {
			updated: [], 
			updatedHash: {},
			removed: [],
			removedHash: {}
		};
	};

	this.onMessage = function(data) {
		switch(data.type) {
			case 'UPDATE':
				this.add(data.item);
				break;
			case 'REMOVE':
				this.remove(data[this._key]);
				break;
		}
	};

	this._saveChanges = function(type, key) {
		if (this._changeDataSave && !this._changeData[type + 'Hash'][key]) {
			this._changeData[type + 'Hash'][key] = true;
			this._changeData[type].push(key);
		}
	};

	this.signalUpdate = function(type, item, id) {
		switch (type) {
			case 'UPDATE':
				this._saveChanges('updated', item[this._key]);
				this.publish('Update', item[this._key], item);
				if (this._hasRemote) {
					this.publish('Remote', {type: 'UPDATE', channel: this._channel, item: item});
				}
				break;

			case 'REMOVE':
				this._saveChanges('removed', item[this._key]);
				this.publish('Remove', id, item);
				if (this._hasRemote) {
					this.publish('Remote', {type: 'REMOVE', channel: this._channel, id: id});
				}
				break;
		}
	};

	var toStringSort = function() {
		return this._sortKey;
	};

	this.add = function(item) {
		if (isArray(item)) {
			for (var i = 0, len = item.length; i < len; ++i) {
				item[i] && this.add(item[i]);
			}
		} else {
			if (this._byID[item[this._key]]) { this.remove(item); }
			var index = this.length++;
			this._byIndex[index] = this._byID[item[this._key]] = item;
			this.signalUpdate('UPDATE', item);
			
			if (this._sorter) {
				item._sortKey = this._sorter(item);
				item.toString = toStringSort;
			}
		}

		return this;
	};
	
	this.remove = function(id) {
		if (typeof id == 'object') { id = id[this._key]; }
		if (!id) { return; }

		if (this._byID[id]) {
			this.signalUpdate('REMOVE', this._byID[id], id);
			delete this._byID[id];
			for (var i = 0, item; item = this._byIndex[i]; ++i) {
				if (item[this._key] == id) {
					this._byIndex.splice(i, 1);
					break;
				}
			}
		}

		--this.length;
		return this;
	};

	this.keepOnly = function(list) {
		var key = this._key;
		
		if (isArray(list)) {
			var ids = {};
			for (var i = 0, n = list.length; i < n; ++i) {
				ids[list[i]] = true;
			}
			list = ids;
		}

		for (var i = 0; i < this.length; ++i) {
			var id = this._byIndex[i][key];
			if (!(id in list)) {
				this.remove(id);
				--i;
			}
		}
	};

	this.clear = function() {
		var index = this._byIndex;

		this._byIndex = [];
		this._byID = {};
		this.length = 0;

		for (var i = 0, item; item = index[i]; ++i) {
			this.signalUpdate('REMOVE', item, item[this._key]);
		}
	};

	this.getCount = function() {
		return this.length;
	};

	this.setSorter = function(sorter) {
		this._sorter = sorter;
		for (var i = 0, item; item = this._byIndex[i]; ++i) {
			item._sortKey = sorter(item);
			item.toString = toStringSort;
		}
		return this;
	};

	this.contains = function(id) {
		return !!this._byID[id];
	};

	this.get = this.getItemForID = function(id) {
		return this._byID[id] || null;
	};

	this.getItemForIndex = function(index) {
		return this._byIndex[index];
	};

	this.sort = function() {
		this._byIndex.sort();
	};

	this.each = function(cb) {
		for (var i = 0; i < this.length; ++i) {
			cb(this._byIndex[i]);
		}
	};

	this.toJSON = function() {
		return {
			key: this._key,
			items: this._byIndex
		};
	};

	this.fromJSON = function(data) {
		this.clear();
		var key = this._key = data.key;
		this.add(data.items);
	};

	this.beginChanges = function() {
		this._changeDataSave = true;
		this._changeData = {
			updated: [], 
			updatedHash: {},
			removed: [],
			removedHash: {}
		};
	};

	this.saveChanges = function() {
		this._changeDataSave = false;
		if (this._persistenceHandler) {
			var changeData = this._changeData,
				i, j;

			this._persistenceHandler.remove(changeData.removed);

			if (changeData.updated.length) {
				var updateList = [];
				for (i = 0, j = changeData.updated.length; i < j; i++) {
					updateList.push(this._byID[changeData.updated[i]]);
				}
				this._persistenceHandler.update(updateList);
			}

			this._persistenceHandler.commit();
		}
	};
});
