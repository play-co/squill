"use import";

from util.browser import $;
import .Widget;
import lib.sort;

var TabbedPane = exports = Class(Widget, function(supr) {

	this._def = {
		className: 'tabbedPane',
		children: [
			{className: 'tabContainerWrapper', children: [
				{id: 'tabContainer', className: 'tabContainer'}
			]},
			{className: 'tabContentsWrapper', children: [
				{id: 'content', className: 'tabContents'}
			]}
		]
	};
	
	this.init = function() {
		this._panes = [];
		supr(this, 'init', arguments);
	}

	this.addNode = function(def, target) {
		if (this.content) {
			merge(def, {
				parent: this.content
			});
		}
		
		var el = supr(this, 'addNode', arguments);
		
		if (el instanceof exports.Pane) {
			this.addPane(el);
			el.hide(); // hack for now!
		}
		
		return el;
	}
	
	this.newPane = function(def) {
		var pane = new exports.Pane(merge({parent: this.content}, def));
		this.addPane(pane);
		
		return pane;
	}
	
	this.addPane = function(pane) {
		var title = pane.getTitle();
		if (title) {
			this._panes[title] = pane;
		}
		
		this._panes.push(pane);
		lib.sort(this._panes, function(pane) { return pane._sortIndex; });
		this.tabContainer.appendChild(pane.tab);
		$.onEvent(pane.tab, 'mousedown', this, 'showPane', pane);
		if (!this._selectedTab) { this.showPane(pane); }
		return this;
	}
	
	this.getTabs = function() { return this._tabs; }
	this.getPanes = function() { return this._panes; }
	
	this.write = function(buffer) {
		this._currentPane.innerHTML = String(buffer);
	}
	
	this.selectPane = this.showPane = function(pane) {
		logger.log('select', pane);
		var tab = pane.tab;
		$.removeClass(this._selectedTab, 'selected');
		$.addClass(tab, 'selected');
		this._selectedTab = tab;
		if (this._selectedPane) { this._selectedPane.hide(); }
		
		this._selectedPane = pane;
		pane.show();
		this.publish('ShowPane', pane);
	}
});

exports.Pane = Class(Widget, function(supr) {
	var sortID = 0;
	
	this._def = {
		className: 'tabPane',
		style: {
			display: 'none'
		}
	}
	
	this.getTitle = function() { return this._opts.title; }
	this.init = function(opts) {
		this._sortIndex = ++sortID;
		
		this.tab =  $({
			text: opts.title,
			tagName: 'a',
			className: 'tab'
		});
		
		supr(this, 'init', arguments);
	}
	
	this.setSortIndex = function(sortIndex) { this._sortIndex = sortIndex; }
});
