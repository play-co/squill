jsio('from util.browser import $');
jsio('import .Widget');

var TabbedPane = exports = Class(Widget, function(supr) {

	Class.ctor(this, supr, {className: 'tabbedPane'});
	
	this.buildWidget = function(el) {
		this._tabContainer = $({
			className: 'tabContainer',
			parent: $({className: 'tabContainerWrapper', parent: el}),
			style: {
				
			}
		});
		
		
		this._content = $({
			className: 'tabContents',
			parent: $({className: 'tabContentsWrapper', parent: el}),
			style: {
				
			}
		});
		
		this._tabs = {};
		this._panes = {};
	}
	
	this.select = function(title) {
		this.showTab(title);
	}
	
	this.newPane = function(title) {
		var tab = $({
			parent: this._tabContainer,
			text: title,
			tagName: 'a',
			className: 'tab',
			style: {
				
			}
		});
		
		$.onEvent(tab, 'mousedown', this, 'showTab', title);
		
		this._tabs[title] = tab;
		this._currentPane = this._panes[title] = $({
				className: 'tabPane',
				style: {
					display: 'none'
				}
			});
		
		this._content.appendChild(this._panes[title]);
		if (!this._selectedTab) {
			this.showTab(title);
		}
		
		return this._currentPane;
	}
	
	this.getTabs = function() { return this._tabs; }
	this.getPanes = function() { return this._panes; }
	
	this.addNode = function(node) {
		this._currentPane.appendChild(node);
		return node;
	}
	
	this.write = function(buffer) {
		this._currentPane.innerHTML = String(buffer);
	}
	
	this.showTab = function(title) {
		if (!this._panes[title]) { return; }
		
		var tab = this._tabs[title];
		$.removeClass(this._selectedTab, 'selected');
		$.addClass(tab, 'selected');
		this._selectedTab = tab;
		
		if (this._selectedPane) { $.hide(this._selectedPane); }
		this._selectedPane = this._panes[title];
		$.show(this._panes[title]);
	}
});
