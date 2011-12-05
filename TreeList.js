"use import";

from util.browser import $;

import .Widget;

var elementIDPrefix = 0;

var TreeList = exports = Class(Widget, function(supr) {	
	this.init = function(opts) {
		this._initClasses(opts);

		elementIDPrefix++;
		this._elementIDPrefix = 'menuItem' + elementIDPrefix + '_';

		this._wrapperId = opts.wrapperId || 'browser';
		this._contentId = opts.contentId || 'contentWrapper';

		this._dataSource = opts.dataSource || null;

		this._def = {id: this._wrapperId, className: 'browser', children: [
						{id: this._contentId, className: 'contentWrapper', children: []}
					]};

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

	this._createMenuId = function(inc) {
		var menuId = this._menuId;
		if (inc) {
			this._menuId++;
		}
		return this._elementIDPrefix + menuId;
	};

	this.addGroup = function(item) {
		var menuId = this._createMenuId(true),
			node = $({
					parent: $({
								parent: $.id(this._contentId),
								id: menuId,
								className: (item === null) ? this._classNames.nodeWrapper : this._classNames.nodeWrapperHidden
							}),
					className: this._classNames.node
				});

		this._menuById[this._menuId] = node;

		if (item) {
			item.menuId = menuId;
			node.depth = item.depth + 1;
		} else {
			node.depth = 0;
		}

		return node;
	};

	/**
	 * item fields:
	 *   parent
	 *   title
	 *   children (optional)
	**/
	this.addItem = function(item) {
		if (!item.children) {
			item.children = [];
		}
		item.id = this._createMenuId(true);
		item.depth = item.parent.depth;
		item.isItem = true;
		item.node = $({
			parent: item.parent,
			id: item.id,
			tag: 'a',
			text: item.title,
			className: item.children.length ? this._classNames.nodeChild : ''
		});
		this._menuById[this._menuId] = item.node;

		$.onEvent(item.id, 'click', this, 'onClick', item);

		return item;
	};

	this._createMenu = function(groupNode, node, depth, isRoot) {
		var children = node.children,
			child,
			i, j = children.length;

		groupNode.depth = depth;
		for (i = 0; i < j; i++) {
			child = children[i];
			child.parent = groupNode;
			this.addItem(child);
		}

		for (i = 0; i < j; i++) {
			child = children[i];
			if (child.children && child.children.length) {
				this._createMenu(this.addGroup(child), child, depth + 1, false);
			}
		}
	};

	this.buildWidget = function() {
		this._menuId = 0;
		this._menuById = [];
		this._menuStack = [];
		this._menuActiveItem = false;

		if (this._dataSource !== null) {
			var root = this._dataSource.getRoot();
			if (root) {
				this._createMenu(this.addGroup(null), root, 0, true);
			}
			console.log(this._menuById);
		}
	};

	this._removeFromStack = function(depth) {
		var menuStack = this._menuStack,
			info;

		while (menuStack.length && (menuStack[menuStack.length - 1].depth >= depth)) {
			info = menuStack.pop();

			$.removeClass(info.id, this._classNames.nodeActive);
			$.removeClass(info.id, this._classNames.nodeActiveChild);

			$.addClass(info.menuId, this._classNames.nodeWrapperHidden);
			$.removeClass(info.menuId, this._classNames.nodeWrapper);
		}
	};

	this._addToStack = function(item) {
		this._menuStack.push(item);

		$.removeClass(item.id, this._classNames.nodeActive);
		$.removeClass(item.id, this._classNames.nodeActiveChild);

		$.addClass(item.id, (item.children && item.children.length) ? this._classNames.nodeActiveChild : this._classNames.nodeActive);

		$.addClass(item.menuId, this._classNames.nodeWrapper);
		$.removeClass(item.menuId, this._classNames.nodeWrapperHidden);
	};

	this.onClick = function(item) {
		var menuStack = this._menuStack,
			id;

		if (this._menuActiveItem) {
			$.removeClass(this._menuActiveItem, this._classNames.nodeSelected);
			$.removeClass(this._menuActiveItem, this._classNames.nodeSelectedChild);
		}

		if (item.children && item.children.length) {
			id = item.menuId;
			if (menuStack.length) {
				if (item.depth > menuStack[menuStack.length - 1].depth) {
					this._addToStack(item);
				} else {
					this._removeFromStack(item.depth);
				}
			}
			this._addToStack(item);
		} else {
			this._removeFromStack(item.depth);
		}

		this._menuActiveItem = item.id;
		$.addClass(this._menuActiveItem, this._classNames.nodeSelected);
		if (menuStack.length) {
			$.id(this._contentId).style.width = ((menuStack.length + 1) * 200) + 'px';
		}

		this.publish('SelectItem', item);
	};

	this.setDataSource = function(dataSource) {
		this._dataSource = dataSource;
	};
});