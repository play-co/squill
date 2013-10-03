from util.browser import $;
import .Widget;
import lib.sort;

var TabbedPane = exports = Class(Widget, function(supr) {

	this._def = {
		className: 'tabbedPane',
		activeTabClassName: 'selected',
		children: [
			{id: 'tabContainerWrapper', className: 'tabContainerWrapper', children: [
				{id: 'tabContainer', className: 'tabContainer', tagName: 'ul'}
			]},
			{id: 'tabContentsWrapper', className: 'tabContentsWrapper', children: [
				{id: 'tabContent', className: 'tabContents'}
			]}
		]
	};

	this.init = function(opts) {
		opts = opts || {};
		this._panes = [];

		supr(this, 'init', arguments);
	};
	
	this.buildWidget = function (el, result) {
		var opts = this._opts;

		this._container = this.tabContent;

		if (opts.tabChildren) {
			this.buildTabChildren(opts.tabChildren, result);
		}

		if (opts.panes) {
			this.buildPanes(opts.panes, result);
		}

		if (opts.paneClassName) {
			$.addClass(this._el, opts.paneClassName);
		}

		if (opts.containerWrapperClassName) {
			$.addClass(this.tabContainerWrapper, opts.containerWrapperClassName);
		}

		if (opts.contentsWrapperClassName) {
			$.addClass(this.tabContentsWrapper, opts.contentsWrapperClassName);
		}

		if (opts.tabContainerClassName) {
			$.addClass(this.tabContainer, opts.tabContainerClassName);
		}
	};

	this.buildTabChildren = function(tabChildren, results) {
		for (var i = 0, def; def = tabChildren[i]; ++i) {
			this.addTabWidget(def, results);
		}
	};

	this.getContainer = function() { return this._container || this._el; }
	
	this.addTabWidget = function(def, results) {
		return this.addWidget(def, this.tabContainer, results);
	};

	this.addWidget = function(def, parent, results) {
		var el = supr(this, 'addWidget', arguments);
		if (el instanceof exports.Pane) {
			this._addPane(el);
		}
		
		return el;
	};
	
	this.buildPanes = function (def, result) {
		def.forEach(function (opts) {
			this.newPane(opts, result);
		}, this);
	}

	this.newPane = function(def, res) {
		return this.addWidget(merge({type: exports.Pane}, def, {tabPaneClassName: this._opts.tabPaneClassName}), null, res);
	}
	
	this._addPane = function(pane) {
		var title = pane.getTitle();
		if (title) {
			this._panes[title] = pane;
		}

		this._panes.push(pane);
		lib.sort(this._panes, function(pane) {return pane._sortIndex; });
		this.tabContainer.appendChild(pane.tab);
		$.onEvent(pane.tab, 'mousedown', this, this.selectPane, pane);
		if (!this._selectedTab) {
			this.showPane(pane);
		} else {
			pane.hide();
		}

		return this;
	}

	this.clear = function() {
		this._panes.length = 0;
		this._selectedTab = null;
		this.tabContent.innerHTML = '';
		this.tabContainer.innerHTML = '';
	};

	this.getTabs = function() {
		return this._tabs;
	};

	this.getPanes = function() {
		return this._panes;
	};

	this.selectPane = function(pane) {
		if (this._selectedTab !== pane.tab) {
			this.publish('SelectPane', pane);
		}
		this.showPane(pane);
	};

	this.getSelectedPane = function() { return this._selectedPane; };

	this.showPane = function(pane) {
		if (!pane) { return; }

		var tab = pane.tab;
		$.removeClass(this._selectedTab, this._opts.activeTabClassName);
		$.addClass(tab, this._opts.activeTabClassName);
		this._selectedTab = tab;
		if (this._selectedPane) { this._selectedPane.hide(); }
		
		this._selectedPane = pane;
		pane.show();
		this.publish('ShowPane', pane);
	};
});

exports.Pane = Class(Widget, function(supr) {
	var sortID = 0;

	this.getTitle = function() { return this._opts.title; };
	this.init = function(opts) {
		this._sortIndex = ++sortID;

		this._def = {
			className: (opts.tabPaneClassName === undefined) ? 'tabPane' : opts.tabPaneClassName,
			style: {
				display: 'none'
			}
		}

		this.tab =  $({
			tagName: 'li',
			children: [{
				tagName: 'a',
				text: opts.title
			}],
			className: 'tab'
		});

		supr(this, 'init', arguments);
	};
	
	this.setSortIndex = function(sortIndex) { this._sortIndex = sortIndex; };
});
