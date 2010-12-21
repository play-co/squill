jsio('from util.browser import $');
jsio('import .Element');

var TabbedPane = exports = Class(Element, function() {
	this.init = function(opts) {
		this._el = $({
			className: 'tabbedPane',
			style: {
			}
		});
		
		this._tabContainer = $({
			className: 'tabContainer',
			parent: this._el,
			style: {
				
			}
		});
		
		this._content = $({
			className: 'tabContents',
			parent: this._el,
			style: {
				
			}
		});
		
		this._tabs = {};
		this._panes = {};
	}
	
	this.select = function(title) {
		this.onTabClick(title);
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
		
		$.onEvent(tab, 'click', this, 'showTab', title);
		
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