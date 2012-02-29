"use import";

import lib.Callback;
import .BasicDataSource as BasicDataSource;

var DataSource = exports = Class(BasicDataSource, function(supr) {

	var defaults = {
		key: 'id'
	};

	this.init = function(opts) {
		opts = merge(opts, defaults);

		supr(this, 'init', [opts]);

		this._byIndex = [];
		this._byID = {};
		this._ctor = opts.ctor;

		this.length = 0;

		this.onLoad = new lib.Callback();

		this.setSorter(opts.sorter);
		this.setPersistence(opts.persistence);

		this._changeDataSave = false;
		this._changeData = {
			updated: [], 
			updatedHash: {},
			removed: [],
			removedHash: {}
		};
	};

	this.setPersistence = function(persistence) {
		this._persistence = persistence;
		if (persistence) {
			this.onLoad.clear();
			persistence.load(this, this.onLoad.chain());
		}
	}

	this._saveChanges = function(type, key) {
		if (this._changeDataSave && !this._changeData[type + 'Hash'][key]) {
			this._changeData[type + 'Hash'][key] = true;
			this._changeData[type].push(key);
		}
	};

	this.signalUpdate = function(type, item, id) {
		if (item[this._key] === undefined) {
			return;
		}
		switch (type) {
			case 'UPDATE':
				this._saveChanges('updated', item[this._key]);
				this.publish('Update', item[this._key], item);
				break;

			case 'REMOVE':
				this._saveChanges('removed', item[this._key]);
				this.publish('Remove', id, item);
				break;
		}
	};

	var toStringSort = function() {
		return this._sortKey;
	};

	this.updated = 
	this.add = function(item) {
		if (isArray(item)) {
			for (var i = 0, len = item.length; i < len; ++i) {
				item[i] && this.add(item[i]);
			}
		} else {
			if (this._byID[item[this.key]]) {
				this.remove(item);
			}

			if (this._ctor && !(item instanceof this._ctor)) {
				item = new this._ctor(item);
			}

			var index = this.length++;
			this._byIndex[index] = this._byID[item[this.key]] = item;
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
		this.compare(list, function(local, remote) {
			if (!remote) {
				this.remove(local);
			}
		});
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
		if (sorter) {
			for (var i = 0, item; item = this._byIndex[i]; ++i) {
				item._sortKey = sorter(item);
				item.toString = toStringSort;
			}
		}
		return this;
	};

	this.contains = function(id) {
		return !!this._byID[id];
	};

	this.getKey = function() {
		return this._key;
	}

	this.get = this.getItemForID = function(id) {
		return this._byID[id] || null;
	};

	this.getItemForIndex = function(index) {
		return this._byIndex[index];
	};

	this.sort = function() {
		this._byIndex.sort();
	};

	this.forEach = this.each = function(cb, context) {
		for (var i = 0; i < this.length; ++i) {
			if (cb.call(context, this._byIndex[i], this._byIndex[i][this._key])) {
				return;
			}
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
		if (this._persistence) {
			var changeData = this._changeData,
				i, j;

			this._persistence.remove(changeData.removed);

			if (changeData.updated.length) {
				var updateList = [];
				for (i = 0, j = changeData.updated.length; i < j; i++) {
					updateList.push(this._byID[changeData.updated[i]]);
				}
				this._persistence.update(updateList);
			}

			this._persistence.commit();
		}
	};

	this.load = function() {
		if (this._persistence) {
			this._persistence.load(bind(this, 'fromJSON'));
		}
	};

	this.save = function() {
		if (this._persistence) {
			this._persistence.save(this);
		}
	}

	this.compare = function(dict, cb) {
		var key = this.key;

		// create a key-indexed copy of dict to run the comparison against
		var compareTo = {};
		if (isArray(dict)) {
			for (var i = 0, n = dict.length; i < n; ++i) {
				compareTo[dict[i][key]] = dict[i];
			}
		} else {
			for (var k in dict) {
				compareTo[k] = dict[k];
			}
		}

		// first, compare all items in the index to the dict items
		var items = this._byIndex;
		for (var i = 0, item; item = items[i]; ++i) {
			var k = item[key];
			cb.call(this, item, compareTo[k]);
			delete compareTo[k];
		}

		// then, for any remaining dict items, they don't exist in the local version
		for (var k in compareTo) {
			cb.call(this, null, compareTo[k]);
		}
	}

	this.filter = function(filter) {
		var result = new DataSource({key: this.key});
		var key;
		var item;
		var match;
		var i;
		var j = this.length;

		result.key = this.key;
		for (i = 0; i < j; ++i) {
			item = this._byIndex[i];
			match = true;
			for (key in filter) {
				if ((typeof item[key] == 'string') && (item[key].toLowerCase().indexOf(filter[key]) == -1)) {
					match = false;
				}
			}

			if (match) {
				result.add(item);
			}
		}

		return result;
	};
});
