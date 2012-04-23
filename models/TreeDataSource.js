"use import";

import .BasicDataSource as BasicDataSource;

var TreeDataSourceNode = Class(function() {
	this.init = function(opts) {
		this._key = opts.key;
		this._parentKey = opts.parentKey,
		this._data = opts.data;
		this._dataContainer = {};
		this._children = [];
		this._parent = opts.parent;
		this._signalUpdate = opts.signalUpdate;

		var dataContainer = this._dataContainer,
			signalUpdate = opts.signalUpdate,
			data = opts.data,
			key = opts.key;

		for (field in data) {
			if (data.hasOwnProperty(field) && (field !== key) && (field[0] !== '_')) {
				this._dataContainer['_' + field] = data[field];
				data.__defineSetter__(field, this._createSetter(dataContainer, field, signalUpdate)());
				data.__defineGetter__(field, this._createGetter(dataContainer, field)());
			}
		}
	};

	this._createSetter = function(dataContainer, field, signalUpdate) {
		return function() {
			return function(value) {
				dataContainer['_' + field] = value;
				signalUpdate('UPDATE_NODE', this);
			};
		};
	};

	this._createGetter = function(dataContainer, field) {
		return function() {
			return function() {
				return dataContainer['_' + field];
			};
		};
	};

	this.clear = function() {
		var children = this._children,
			child,
			data,
			i;

		this._signalUpdate('REMOVE', this._data);

		while (children.length) {
			child = children.pop();
			data = child.getData();
			child.clear();
		}
	};

	this.removeChild = function(node) {
		var children = this._children,
			i, j

		for (i = 0, j = children.length; i < j; i++) {
			child = children[i];
			if (child === node) {
				child.clear();
				children.splice(i, 1);
				return true;
			}
		}

		return false;
	};

	this.remove = function() {
		return this._parent && this._parent.removeChild(this);
	};

	this.addChild = function(node) {
		this._children.push(node);
	};

	this.callback = function(cb) {
		var children = this._children,
			i, j

		cb(this._data);
		for (i = 0, j = children.length; i < j; i++) {
			children[i].callback(cb);
		}
	};

	this.sort = function() {
		var children = this._children,
			i, j

		children.sort();
		for (i = 0, j = children.length; i < j; i++) {
			children[i].sort();
		}
	};

	this.getData = function() {
		return this._data;
	};

	this.setData = function(data) {
		this._data = data;
	};

	this.getParent = function() {
		return this._parent;
	};

	this.getChildren = function() {
		return this._children;
	};

	this.toJSONData = function(list, singleItem) {
		list = list || [];

		var children = this._children,
			node = {},
			data = this._data,
			i, j;

		for (i in data) {
			if (data.hasOwnProperty(i)) {
				if (i === this._parentKey) {
					if (data[i] === null) {
						node[i] = null;
					} else {
						node[i] = this._parent.getData()[this._key];
					}
				} else {
					node[i] = data[i];
				}
			}
		}

		if (singleItem) {
			return node;
		} else {
			list.push(node);

			for (i = 0, j = children.length; i < j; i++) {
				children[i].toJSONData(list, false);
			}
		}

		return list;
	};

	this.toJSON = function() {
		return this.toJSONData([], false);
	};
});

/**
 * @extends squill.models.BasicDataSource
 */
var TreeDataSource = exports = Class(BasicDataSource, function(supr) {
	var defaults = {
		key: 'id',
		parentKey: 'parent',
		channel: null,
		hasRemote: false
	};

	this.init = function(opts) {
		opts = opts || {};
		opts = merge(opts, defaults);

		supr(this, 'init', [opts]);

		this._maxKey = 0;
		this._parentKey = opts.parentKey;

		this._nodeByKey = {};
		this._root = null;

		this._sorter = null;
		if (opts.sorter) {
			this.setSorter(opts.sorter);
		}

		this._persistenceHandler = opts.persistenceHandler || null;

		this._changeDataSave = false;
		this._changeData = {
			updated: [], 
			updatedHash: {},
			removed: [],
			removedHash: {}
		};
	};

	this._saveChanges = function(type, key) {
		if (this._changeDataSave && !this._changeData[type + 'Hash'][key]) {
			this._changeData[type + 'Hash'][key] = true;
			this._changeData[type].push(key);
		}
	};

	this.signalUpdate = function(type, node) {
		var key = this._key,
			keyValue = node[key],
			channel = this._channel,
			data;

		switch (type) {
			case 'UPDATE_NODE':
				// This is a hack, this._nodeByKey[node[key]]._data should be equal to node but isn't...
				this._nodeByKey[node[key]].setData(node);

			case 'UPDATE':
				this._saveChanges('updated', keyValue);
				this.publish('Update', node, keyValue);
				if (this._hasRemote) {
					this.publish('Remote', {type: 'UPDATE', channel: channel, node: node, key: keyValue});
				}
				break;

			case 'REMOVE':
				this._saveChanges('removed', keyValue);
				this.publish('Remove', node, keyValue);
				if (this._hasRemote) {
					this.publish('Remote', {type: 'REMOVE', channel: channel, node: node, key: keyValue});
				}
				delete(this._nodeByKey[keyValue]);
				break;
		}
	};

	var toStringSort = function() {
		return this._sortKey;
	};

	this.add = function(node) {
		var parent = node[this._parentKey] || null,
			internalParent,
			internalNode,
			key,
			i;

		if (isArray(node)) {
			for (i = 0, j = node.length; i < j; i++) {
				node[i] && this.add(node[i]);
			}
		} else {
			key = this._key;

			if (!node[key]) {
				node[key] = this._maxKey + 1;
			} else if (this._nodeByKey[node[key]]) {
				// @todo remove?
			}

			if (!isNaN(parseInt(node[key], 10))) {
				this._maxKey = Math.max(this._maxKey, parseInt(node[key], 10));
			}

			internalParent = parent ? this._nodeByKey[parent[key]] : null;
			internalNode = new TreeDataSourceNode({
				key: this._key,
				parentKey: this._parentKey,
				parent: internalParent,
				data: node,
				signalUpdate: bind(this, this.signalUpdate)
			});

			this._nodeByKey[node[key]] = internalNode;

			if (internalParent) {
				internalParent.addChild(internalNode);
				this.signalUpdate('UPDATE', internalParent.getData());
			} else {
				this._root = internalNode;
			}

			this.signalUpdate('UPDATE', internalNode.getData());

			if (this._sorter) {
				internalNode._sortKey = this._sorter(internalNode.getData());
				internalNode.toString = toStringSort;
			}
		}

		return node;
	};

	this.remove = function(node) {
		var key = node[this._key],
			internalNode = this._nodeByKey[key];

		if (internalNode) {
			internalNode.remove();
		}

		return this;
	};

	this.clear = function() {
		this._maxKey = -1;
		if (this._root !== null) {
			this._root.clear();
			this._root = null;
		}
	};

	this.getRoot = function() {
		return this._root;
	};

	this.toJSON = function() {
		var result = {
			key: this._key,
			parentKey: this._parentKey,
			items: this._root ? this._root.toJSON() : []
		};

		return result;
	};

	/**
	var demoData = {
			key: 'id',
			parentKey: 'parent',
			items: [
				{id: 1, parent: null, title: 'Example item 0', test: 'A'},
		
				{id: 2, parent: 1, title: 'Example item 1', test: 'B'},
				{id: 3, parent: 1, title: 'Example item 2', test: 'C'},

				{id: 4, parent: 3, title: 'Example item 3', test: 'D'},
				{id: 5, parent: 3, title: 'Example item 4', test: 'E'}
			]
		};

	**/
	this.fromJSON = function(data) {
		this._key = data.key;
		this._parentKey = data.parentKey;

		var parentKey = this._parentKey,
			items = data.items,
			item,
			i, j;

		var toString = function() {
			return !this[parentKey] ? '00000000' : 10000000 + this[parentKey];
		}

		for (i = 0, j = items.length; i < j; i++) {
			item = items[i];
			item.toString = toString;
			if ((item[parentKey] === null) || (item[parentKey] === -1)) {
				item[parentKey] = null;
			}
		}

		for (i = 0, j = items.length; i < j; i++) {
			item = items[i];
			if (item) {
				item[parentKey] = this._nodeByKey[item[parentKey]] ? this._nodeByKey[item[parentKey]].getData() : null;
				this.add(item);
			}
		}
	};

	this.each = function(cb) {
		this._root && this._root.callback(cb);
	};

	this.genKey = function() {
		this._maxKey + 1;
		return this._maxKey;
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
					updateList.push(this._nodeByKey[changeData.updated[i]].toJSONData(false, true));
				}
				this._persistenceHandler.update(updateList);
			}

			this._persistenceHandler.commit();
		}
	};

	this.setSorter = function(sorter) {
		this._sorter = sorter;
	};

	this.setPersistenceHandler = function(persistenceHandler) {
		this._persistenceHandler = persistenceHandler;
	};

	this.getByKey = function(id) {
		return this._nodeByKey[id] || null;
	};

	this.sort = function() {
		if (this._root) {
			this._root.sort();
		}
	};

	this.load = function(onLoad) {
		if (this._persistenceHandler) {
			this.clear();

			this._persistenceHandler.load(
				bind(
					this,
					function(data) {
						this.fromJSON({
							key: data.key,
							parentKey: this._parentKey,
							items: data.items
						});
						onLoad && onLoad();
					}
				),
				bind(
					this,
					this._reportError
				)
			);
		}
	};

	this._reportError = function(message) {
		this.publish('Error', message);
	};
});