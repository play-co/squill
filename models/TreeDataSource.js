"use import";

import lib.PubSub;
import std.js as JS;

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
				signalUpdate('UPDATE', this);
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
			if (children[i] === node) {
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

	this.getData = function() {
		return this._data;
	};

	this.toJSONData = function(list) {
		list = list || [];

		var children = this._children,
			node = {},
			data = this._data,
			i, j;

		for (i in data) {
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
		list.push(node);

		for (i = 0, j = children.length; i < j; i++) {
			children[i].toJSONData(list);
		}

		return list;
	};

	this.toJSON = function() {
		return this.toJSONData();
	};
});

var TreeDataSource = exports = Class(lib.PubSub, function() {
	var defaults = {
		key: 'id',
		parentKey: 'parent',
		channel: null,
		hasRemote: false
	};

	this.init = function(opts) {
		opts = opts || {};
		opts = merge(opts, defaults);

		this._key = opts.key;
		this._parentKey = opts.parentKey;
		this._channel = opts.channel;
		this._hasRemote = opts.hasRemote;

		this._nodeByKey = {};
		this._root = null;
	};

	this._signalUpdate = function(type, node) {
		var key = this._key,
			channel = this._channel;

		switch (type) {
			case 'UPDATE':
				this.publish('Update', node, node[key]);
				if (this._hasRemote) {
					this.publish('Remote', {type: 'UPDATE', channel: channel, node: node, key: node[key]});
				}
				break;

			case 'REMOVE':
				this.publish('Remove', node, node[key]);
				if (this._hasRemote) {
					this.publish('Remote', {type: 'REMOVE', channel: channel, node: node, key: node[key]});
				}
				break;
		}
	};

	this.add = function(node, parent) {
		var internalParent,
			internalNode,
			key,
			i;

		if (JS.isArray(node)) {
			for (i = 0, j = node.length; i < j; i++) {
				node[i] && this.add(node[i], parent);
			}
		} else {
			key = this._key;
			if (this._nodeByKey[node[key]]) {
				// @todo remove?
			}

			internalParent = parent ? this._nodeByKey[parent[key]] : null;
			internalNode = new TreeDataSourceNode({
				key: this._key,
				parentKey: this._parentKey,
				parent: internalParent,
				data: node,
				signalUpdate: bind(this, this._signalUpdate)
			});

			this._nodeByKey[node[key]] = internalNode;

			if (internalParent) {
				internalParent.addChild(internalNode);
				this._signalUpdate('UPDATE', internalParent.getData());
			} else {
				this._root = internalNode;
			}

			this._signalUpdate('UPDATE', internalNode.getData());
		}

		return this;
	};

	this.remove = function(node) {
		this._signalUpdate('REMOVE', node);

		var key = node[this._key],
			internalNode = this._nodeByKey[key];

		if (internalNode) {
			internalNode.remove(internalNode);
			delete(this._nodeByKey[key]);
		}

		return this;
	};

	this.clear = function() {
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

		for (i = 0, j = items.length; i < j; i++) {
			item = items[i];
			item[parentKey] = item[parentKey] ? this._nodeByKey[item[parentKey]].getData() : null;
			this.add(item, item[parentKey]);
		}
	};

	this.each = function(cb) {
		this._root && this._root.callback(cb);
	};
});