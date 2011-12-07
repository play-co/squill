"use import";

import .BasicDataSource as BasicDataSource;

var DataSource = exports = Class(BasicDataSource, function() {

	var defaults = {
		key: 'id',
		channel: null,
		hasRemote: false
	};

	this.init = function(opts) {
		opts = merge(opts, defaults);

		this._byIndex = [];
		this._byID = {};

		this.length = 0;
		this._persistenceHandler = opts.persistenceHandler || null;

		if (opts.sorter) {
			this.setSorter(opts.sorter);
		}
	};

	this.onMessage = function(data) {
		switch(data.type) {
			case 'UPDATE':
				this.add(data.item);
				break;
			case 'REMOVE':
				this.remove(data[this.key]);
				break;
		}
	};

	this.signalUpdate = function(item) {
		this.publish('Update', item[this.key], item);
		if (this._hasRemote) {
			this.publish('Remote', {type: 'UPDATE', channel: this._channel, item: item});
		}
	};

	var toStringSort = function() { return this._sortKey; };

	this.add = function(item) {
		if (isArray(item)) {
			for (var i = 0, len = item.length; i < len; ++i) {
				item[i] && this.add(item[i]);
			}
		} else {
			if (this._byID[item[this.key]]) { this.remove(item); }
			var index = this.length++;
			this._byIndex[index] = this._byID[item[this.key]] = item;
			this.signalUpdate(item);
			
			if (this._sorter) {
				item._sortKey = this._sorter(item);
				item.toString = toStringSort;
			}
		}

		return this;
	};
	
	this.remove = function(id) {
		if (typeof id == 'object') { id = id[this.key]; }
		if (this._byID[id]) {
			delete this._byID[id];
			for (var i = 0, item; item = this._byIndex[i]; ++i) {
				if (item[this.key] == id) {
					this._byIndex.splice(i, 1);
					break;
				}
			}
			
			this.publish('Remove', id, item);
			if (this._hasRemote) {
				this.publish('Remote', {type: 'REMOVE', channel: this._channel, id: id});
			}
		}

		--this.length;
		return this;
	};

	this.keepOnly = function(list) {
		var key = this.key;
		
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
			this.publish('Remove', item[this.key]);
		}
	};

	this.getCount = function() { return this.length; };

	this.setSorter = function(sorter) {
		this._sorter = sorter;
		for (var i = 0, item; item = this._byIndex[i]; ++i) {
			item._sortKey = sorter(item);
			item.toString = toStringSort;
		}
		return this;
	};

	this.contains = function(id) { return !!this._byID[id]; };
	this.get = this.getItemForID = function(id) { return this._byID[id] || null; };
	this.getItemForIndex = function(index) { return this._byIndex[index]; };
	this.sort = function() { this._byIndex.sort(); };

	this.each = function(cb) {
		for (var i = 0; i < this.length; ++i) {
			cb(this._byIndex[i]);
		}
	};

	this.toJSON = function() {
		return {
			key: this.key,
			items: this._byIndex
		};
	};

	this.fromJSON = function(data) {
		this.clear();
		var key = this.key = data.key;
		this.add(data.items);
	};
});
