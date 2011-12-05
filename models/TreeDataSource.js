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

	this.add = function(node, parentNode) {
		if (JS.isArray(node)) {
			for (var i = 0, j = node.length; i < j; i++) {
				node[i] && this.add(node[i]);
			}
		} else {
			if (parentNode) {
				if (!parentNode.children) {
					parentNode.children = [];
				}
				parentNode.children.push(node)

				this.publish('Update', parentNode, parentNode[this._key]);
				if (this._hasRemote) {
					this.publish('Remote', {type: 'UPDATE', channel: this._channel, node: parentNode, key: parentNode[this._key]});
				}
			} else {
				this._root = node;
			}

			node.parent = parentNode || null;
			this.publish('Update', node, node[this._key]);
			if (this._hasRemote) {
				this.publish('Remote', {type: 'UPDATE', channel: this._channel, node: node, key: node[this._key]});
			}
		}

		return this;
	};

	this.remove = function(node) {
		if (node.parent) {
			var children = node.parent.children,
				found = false;
				i, j;
			
			for (i = 0, j = children.length; i < j; i++) {
				if (children[i] === node) {
					found = true;
				}
				if (found && (i < j - 1)) {
					children[i] = children[i + 1];
				}
			}
			children.pop();
		}

		this.publish('Remove', node);
		if (this._hasRemote) {
			this.publish('Remote', {type: 'REMOVE', channel: this._channel, node: node});
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
			this._each(node, cb);
		}
	};
});