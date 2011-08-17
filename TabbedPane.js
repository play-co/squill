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
	
	this.buildWidget = function(el) {
		this._panes = [];
	}
	
	this.newPane = function(def) {
		var pane = this._currentPane = new exports.Pane(merge({parent: this.content}, def));
		if (def.title) { this._panes[def.title] = pane; }
		
		this._panes.push(pane);
		lib.sort(this._panes, function(pane) { return pane._sortIndex; });
		
		this.tabContainer.appendChild(pane.tab);
		
		$.onEvent(pane.tab, 'mousedown', this, 'showPane', pane);
		if (!this._selectedTab) { this.showPane(pane); }
		return pane;
	}
	
	this.getTabs = function() { return this._tabs; }
	this.getPanes = function() { return this._panes; }
	
	this.write = function(buffer) {
		this._currentPane.innerHTML = String(buffer);
	}
	
	this.selectPane = this.showPane = function(pane) {
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


exports.Pane = Class(Widget, function() {
	var sortID = 0;
	
	this._def = {
		className: 'tabPane',
		style: {
			display: 'none'
		}
	}
	
	this.getTitle = function() { return this._opts.title; }
	
	this.buildWidget = function() {
		this._sortIndex = ++sortID;
		
		this.tab =  $({
			text: this._opts.title,
			tagName: 'a',
			className: 'tab'
		});
	}
	
	this.setSortIndex = function(sortIndex) { this._sortIndex = sortIndex; }
});
