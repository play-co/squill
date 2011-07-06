jsio('import lib.PubSub');
jsio('import std.js as JS');

var DataSource = exports = Class(lib.PubSub, function() {
	this.init = function(channel, hasRemote) {
		this._channel = channel;
		this._byIndex = [];
		this._byId = {};
		this._hasRemote = hasRemote || false;
		this._count = 0;
	}
	
	this.onMessage = function(data) {
		switch(data.type) {
			case 'UPDATE':
				this.add(data.item);
				break;
			case 'REMOVE':
				this.remove(data.id);
				break;
		}
	}
	
	// signals an item has changed -- see replace
	this.signalUpdate = function(item) {
		this.publish('Update', item.id);
		if (this._hasRemote) {
			this.publish('Remote', {type: 'UPDATE', channel: this._channel, item: item});
		}
	}
	
	this.add = function(item) {
		if (JS.isArray(item)) {
			for (var i = 0, len = item.length; i < len; ++i) {
				this.add(item[i]);
			}
		} else {
			if (this._byId[item.id]) { this.remove(item); }
			var index = this._count++;
			this._byIndex[index] = this._byId[item.id] = item;
			this.signalUpdate(item);
		}
		return this;
	}
	
	this.remove = function(id) {
		if (typeof id == 'object') { id = id.id; }
		if (this._byId[id]) {
			delete this._byId[id];
			for (var i = 0, item; item = this._byIndex[i]; ++i) {
				if (item.id == id) {
					this._byIndex.splice(i, 1);
					break;
				}
			}
			
			this.publish('Remove', id);
			if (this._hasRemote) {
				this.publish('Remote', {type: 'REMOVE', channel: this._channel, id: id});
			}
		}
		
		--this._count;
		return this;
	}
	
	this.clear = function() {
		var index = this._byIndex;
		this._byIndex = [];
		this._byId = {};
		this._count = 0;
		for (var i = 0, item; item = index[i]; ++i) {
			this.publish('Remove', item.id);
		}
	}
	
	this.getCount = function() { return this._count; }
	
	this.setSorter = function(sorter) { this._sorter = sorter; return this; }
	
	this.contains = function(id) { return !!this._byId[id]; }
	this.get = function(id) { return typeof id == 'string' ? this._byId[id] : this._byIndex[id]; }
	this.getItemForId = function(id) { return this._byId[id] || null; }
	this.getItemForIndex = function(index) { return this._byIndex[index]; }
	this.sort = function() {}
});
