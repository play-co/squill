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

		this._createMenus(opts.menuData || this._exampleTreeData());

		supr(this, 'init', arguments);
	};

	this._exampleTreeData = function() {
		return [
			{
				title: 'Example item 0',
				children: [
					{
						title: 'Example item 1',
						children: [
							{title: 'Example item 2'},
							{title: 'Example item 3'},
							{title: 'Example item 4'},
							{
								title: 'Example item 5',
								children: [
									{ title: 'Example item 6' },
									{ title: 'Example item 7' },
									{ title: 'Example item 8' },
									{ title: 'Example item 9' }
								]
							}
						]
					}
				]
			}
		];
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
		var n = this._menuId + '';
		while (n.length < 6) {
			n = '0' + n;
		}
		if (inc) {
			this._menuId++;
		}
		return this._elementIDPrefix + n;
	};

	this._createMenu = function(list, children, isRoot) {
		var child,
			node,
			i, j = children.length;

		node = {
					id: this._createMenuId(true),
					className: isRoot ? this._classNames.nodeWrapper : this._classNames.nodeWrapperHidden,
					children: [{className: this._classNames.node, children: []}]
				};

		this._menuById[this._menuId] = node;

		for (i = 0; i < j; i++) {
			child = children[i];
			child.id = this._createMenuId(true);
			child.isItem = true;
			this._menuById[this._menuId] = child;
			node.children[0].children.push({
				id: child.id,
				tag: 'a',
				text: children[i].title,
				className: child.children && child.children.length ? this._classNames.nodeChild : ''
			});
		}

		list.children.push(node);

		for (i = 0; i < j; i++) {
			child = children[i];
			if (child.children && child.children.length) {
				child.menuId = this._createMenuId(false);
				child.hasChildren = true;
				this._createMenu(list, child.children, false);
			}
		}
	};

	this._createMenus = function(menuData) {
		this._def = {id: this._wrapperId, className: 'browser', children: [
						{id: this._contentId, className: 'contentWrapper', children: []}
					]};

		this._menuId = 0;
		this._menuById = [];
		this._menuStack = [];
		this._menuActiveItem = false;

		this._createMenu(this._def.children[0], menuData, true);
	};

	this.buildWidget = function() {
		var menuById = this._menuById,
			i, j = menuById.length;

		for (i = 1; i < j; i++) {
			if (menuById[i].isItem) {
				$.onEvent(menuById[i].id, 'click', this, 'onClick', i);
			}
		}
	};

	this._removeFromStack = function(greaterThanId) {
		var menuStack = this._menuStack,
			info;

		while (menuStack.length && (menuStack[menuStack.length - 1].menuId > greaterThanId)) {
			info = menuStack.pop();

			$.removeClass(info.itemId, this._classNames.nodeActive);
			$.removeClass(info.itemId, this._classNames.nodeActiveChild);

			$.addClass(info.menuId, this._classNames.nodeWrapperHidden);
			$.removeClass(info.menuId, this._classNames.nodeWrapper);
		}
	};

	this._addToStack = function(itemId, itemChildren, menuId) {
		this._menuStack.push({itemId: itemId, menuId: menuId});

		$.removeClass(itemId, this._classNames.nodeActive);
		$.removeClass(itemId, this._classNames.nodeActiveChild);

		$.addClass(itemId, itemChildren ? this._classNames.nodeActiveChild : this._classNames.nodeActive);

		$.addClass(menuId, this._classNames.nodeWrapper);
		$.removeClass(menuId, this._classNames.nodeWrapperHidden);
	};

	this.onClick = function(index) {
		var menuStack = this._menuStack,
			menuById = this._menuById,
			item = menuById[index],
			id;

		if (this._menuActiveItem) {
			$.removeClass(this._menuActiveItem, this._classNames.nodeSelected);
			$.removeClass(this._menuActiveItem, this._classNames.nodeSelectedChild);
		}

		if (item.hasChildren) {
			id = item.menuId;
			if (menuStack.length) {
				if (item.id > menuStack[menuStack.length - 1].menuId) {
					this._addToStack(item.id, item.children && item.children.length, id);
				} else {
					this._removeFromStack(item.id);
				}
			} else {
				this._addToStack(item.id, item.children && item.children.length, id);
			}
		} else {
			this._removeFromStack(item.id);
		}

		this._menuActiveItem = item.id;
		$.addClass(this._menuActiveItem, this._classNames.nodeSelected);
		if (menuStack.length) {
			$.id(this._contentId).style.width = ((menuStack.length + 1) * 200) + 'px';
		}

		this.publish('SelectItem', item);
	};
});