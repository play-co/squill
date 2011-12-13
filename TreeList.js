"use import";

from util.browser import $;

import .Widget;

var elementIDPrefix = 0;

var TreeList = exports = Class(Widget, function(supr) {	
	var defaults = {
		key: 'id',
		label: 'title',
		wrapperId: 'browser',
		contentId: 'contentWrapper'
	};

	this.init = function(opts) {
		opts = opts || {};
		opts = merge(opts, defaults);

		this._initClasses(opts);

		this._key = opts.key;
		this._label = opts.label;
		this._wrapperId = opts.wrapperId;
		this._contentId = opts.contentId;

		elementIDPrefix++;
		this._elementIDPrefix = 'menuItem' + elementIDPrefix + '_';

		if (opts.dataSource) {
			this.setDataSource(opts.dataSource);
		} else {
			this._dataSource = null;
		}

		this._def = {id: this._wrapperId, className: 'browser', children: [
						{id: this._contentId, className: 'contentWrapper', children: []}
					]};

		this._root = null;
		this._itemByKey = {};

		supr(this, 'init', arguments);
	};

	this._initClasses = function(opts) {
		this._classNames = {
			nodeWrapper: opts.nodeWrapper || 'browserNodeWrapper',
			nodeWrapperHidden: opts.nodeWrapperHidden || 'browserNodeWrapperHidden',
			node: opts.node || 'browserNode',
			nodeChild: opts.nodeChild || 'browserNodeChild',
			nodeActive: opts.nodeActive || 'browserNodeActive',
			nodeActiveChild: opts.nodeActiveChild || 'browserNodeActiveChild',
			nodeSelected: opts.nodeSelected || 'browserNodeSelected',
			nodeSelectedChild: opts.nodeSelectedChild || 'browserNodeSelectedChild'
		};
	};

	this._clearItem = function(item) {
		var parent,
			children,
			i, j;

		if (item.children) {
			children = item.children;
			while (children.length) {
				this._clearItem(children.pop());
			}
		}

		if (item.parent) {
			parent = item.parent;
			children = parent.children;
			for (i = 0, j = children.length; i < j; i++) {
				if (children[i] === item) {
					children.splice(i, 1);
					break;
				}
			}
			if (!children.length && parent.group) {
				$.remove(parent.group.parentNode);
				$.remove(parent.group);
				$.removeClass(parent.node, this._classNames.nodeChild);
				$.removeClass(parent.node, this._classNames.nodeActiveChild);
				delete(parent.group);
			}
		}

		$.remove(item.node);
		item.group && $.remove(item.group);
	};

	this._createMenuId = function(inc) {
		var menuId = this._menuId;
		if (inc) {
			this._menuId++;
		}
		return this._elementIDPrefix + menuId;
	};

	this._createGroup = function(visible) {
		var menuId = this._createMenuId(true),
			node = $({
					parent: $({
								parent: $.id(this._contentId),
								id: menuId,
								className: visible ? this._classNames.nodeWrapper : this._classNames.nodeWrapperHidden
							}),
					className: this._classNames.node
				});

		node.menuId = menuId;
		return node;
	};

	this._createItem = function(item, group) {
		var id = this._createMenuId(true);

		item.node = $({parent: group, id: id, tag: 'a', text: item[this._label]});
		$.onEvent(id, 'click', this, 'onClick', item);
	};

	this.buildWidget = function() {
		this._menuId = 0;
		this._menuById = [];
		this._menuStack = [];
		this._menuActiveItem = false;

		if (this._dataSource !== null) {
			this._dataSource.each(bind(this, this.onCreateItem));
		}
	};

	this._removeFromStack = function(depth) {
		var menuStack = this._menuStack,
			info;

		while (menuStack.length && (menuStack[menuStack.length - 1].depth >= depth)) {
			info = menuStack.pop();

			$.removeClass(info.node.id, this._classNames.nodeActive);
			$.removeClass(info.node.id, this._classNames.nodeActiveChild);

			if (info.group) {
				$.addClass(info.group.menuId, this._classNames.nodeWrapperHidden);
				$.removeClass(info.group.menuId, this._classNames.nodeWrapper);
			}
		}
	};

	this._addToStack = function(item) {
		this._menuStack.push(item);

		$.removeClass(item.node.id, this._classNames.nodeActive);
		$.removeClass(item.node.id, this._classNames.nodeActiveChild);

		$.addClass(item.node.id, (item.children && item.children.length) ? this._classNames.nodeActiveChild : this._classNames.nodeActive);

		if (item.group) {
			$.addClass(item.group.menuId, this._classNames.nodeWrapper);
			$.removeClass(item.group.menuId, this._classNames.nodeWrapperHidden);
		}
	};

	this.onClick = function(item) {
		var menuStack = this._menuStack,
			id,
			i;

		if (this._menuActiveItem) {
			$.removeClass(this._menuActiveItem.node, this._classNames.nodeSelected);
			$.removeClass(this._menuActiveItem.node, this._classNames.nodeSelectedChild);
		}

		if (menuStack.length && (item.depth <= menuStack[menuStack.length - 1].depth)) {
			this._removeFromStack(item.depth);
		}
		this._addToStack(item);

		this._menuActiveItem = item;
		$.addClass(this._menuActiveItem.node, this._classNames.nodeSelected);
		if (menuStack.length) {
			i = menuStack.length;
			if (menuStack[menuStack.length - 1].children && menuStack[menuStack.length - 1].children.length) {
				i++;
			}
			$.id(this._contentId).style.width = (i * 200 + 500) + 'px';
		}

		this.publish('SelectItem', item.data);
	};

	this.onUpdateItem = function(item, key) {
		var treeItem = {title: item[this._label]},
			parentItem,
			group;

		if (this._itemByKey[key]) {
			this._itemByKey[key].node.innerHTML = item[this._label];
			return;
		}

		if (item.parent === null) {
			this._rootGroup = this._createGroup(true);
			this._createItem(treeItem, this._rootGroup);
			this._root = treeItem;
			treeItem.depth = 0;
			treeItem.parent = null;
		} else {
			if (this._menuActiveItem) {
				$.removeClass(this._menuActiveItem.node, this._classNames.nodeSelected);
				$.removeClass(this._menuActiveItem.node, this._classNames.nodeSelectedChild);
				this._removeFromStack(this._menuActiveItem.depth);
				this._menuActiveItem = false;
			}

			parentItem = this._itemByKey[item.parent[this._key]];
			if (parentItem) {
				if (!parentItem.group) {
					parentItem.group = this._createGroup(false);
				}
				if (!parentItem.children) {
					parentItem.children = [];
				}
				parentItem.children.push(treeItem);
				this._createItem(treeItem, parentItem.group);
			}
			treeItem.depth = parentItem.depth + 1;
			treeItem.parent = parentItem;
			$.addClass(parentItem.node.id, this._classNames.nodeChild);
		}

		treeItem.data = item;
		this._itemByKey[key] = treeItem;
	};

	this.onCreateItem = function(item) {
		this.onUpdateItem(item, item[this._key]);
	};

	this.onRemoveItem = function(item, key) {
		if (this._itemByKey[key]) {
			this._removeFromStack(this._itemByKey[key].depth);
			this._clearItem(this._itemByKey[key]);
			this._menuActiveItem = false;

			delete(this._itemByKey[key]);
			this.publish('UnSelectItem');
		}
	};

	this.showItem = function(item) {
		if (this._itemByKey[item[this._key]]) {
			console.log('show item:', this._itemByKey[item[this._key]]);
		}
	};

	this.setDataSource = function(dataSource) {
		this._dataSource = dataSource;
		this._dataSource.subscribe('Update', this, this.onUpdateItem);
		this._dataSource.subscribe('Remove', this, this.onRemoveItem);
	};

	this.getPathString = function(separator) {
		var result = '',
			menuStack = this._menuStack,
			i, j;

		separator = separator || ' ';
		for (i = 0, j = menuStack.length; i < j; i++) {
			if (result !== '') {
				result += separator;
			}
			result += menuStack[i].data[this._label];
		}

		return result;
	};
});