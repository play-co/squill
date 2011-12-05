"use import";

import lib.PubSub;
import std.js as JS;

var TreeDataSource = exports = Class(lib.PubSub, function() {
	var defaults = {
		key: 'id',
		channel: null,
		hasRemote: false
	};

	this.init = function(opts) {
		opts = opts || {};
		opts = merge(opts, defaults);

		this._key = opts.key;
		this._channel = opts.channel;
		this._hasRemote = opts.hasRemote;

		this._hasRemote = opts.hasRemote;
		this._root = null;
	};

	this._clearNode = function(node) {
		var children = node.children,
			child,
			i;

		if (children) {
			while (children.length) {
				child = children.pop();
				this._clearNode(child);
				this.publish('Remove', child, child[this._key]);
			}
		}
	};

	this._createSetter = function(field, cb) {
		return function() {
			return function(value) {
				this[field] = value;
				cb(this);
			};
		}
	};

	this._createGetter = function(field) {
		return function() {
			return function() {
				return this[field];
			};
		};
	};

	this._signalUpdate = function(node) {
		this.publish('Update', node, node[this._key]);
		if (this._hasRemote) {
			this.publish('Remote', {type: 'UPDATE', channel: this._channel, node: node, key: node[this._key]});
		}
	};

	this.add = function(node, parentNode) {
		var i;

		if (JS.isArray(node)) {
			for (i = 0, j = node.length; i < j; i++) {
				node[i] && this.add(node[i], parentNode);
			}
		} else {
			for (i in node) {
				if (node.hasOwnProperty(i) && (i !== this._key) && (i[0] !== '_')) {
					node['_' + i] = node[i];
					node.__defineSetter__(i, this._createSetter('_' + i, bind(this, this._signalUpdate))());
					node.__defineGetter__(i, this._createGetter('_' + i)());
				}
			}

			if (parentNode) {
				if (!parentNode.children) {
					parentNode.children = [];
				}
				parentNode.children.push(node)
				this._signalUpdate(parentNode);
			} else {
				this._root = node;
			}

			node.parent = parentNode || null;
			this._signalUpdate(node);
		}

		return this;
	};

	this.remove = function(node) {
		this.publish('Remove', node, node[this._key]);
		if (this._hasRemote) {
			this.publish('Remote', {type: 'REMOVE', channel: this._channel, node: node, key: node[this._key]});
		}

		if (node.parent) {
			var children = node.parent.children,
				found = false,
				i, j;
			
			for (i = 0, j = children.length; i < j; i++) {
				if (children[i] === node) {
					children.splice(i, 1);
					break;
				}
			}
		}

		return this;
	};

	this.clear = function() {
		if (this._root !== null) {
			this._clearNode(this._root);
			this.publish('Remove', this._root);
			this._root = null;
		}
	};

	this.getRoot = function() {
		return this._root;
	};

	this._each = function(node, cb) {
		cb(node);

		var children = node.children,
			i, j;

		if (children) {
			for (i = 0, j = children.length; i < j; i++) {
				this._each(children[i], cb);
			}
		}
	};

	this.each = function(cb) {
		if (this._root !== null) {
			this._each(this._root, cb);
		}
	};
});