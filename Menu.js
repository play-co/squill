"use import";

import .Widget;
import .TextButton;
import .Label;

from util.browser import $;

exports = Class(Widget, function(supr) {
	// this.init = function(params) {
	// 	var params = JS.merge(params, {parent: $.id('wrapper')});
	// 	supr(this, 'init', [params]);
	// }
	
	this.buildContent = function() {
		$.apply(this._el, {
			className: 'menu',
		});
		
		if (!this._def || !this._def.navHidden) {
			$.addClass(this._el, 'hasNavBar');
			
			this._nav = new exports.NavBar({
				title: this._def.name,
				parent: this,
				before: this._el.firstChild,
				delegate: bind(this, 'handleNavBar')
			});
		}
		
		return supr(this, 'buildContent', arguments);
	}
	
	this.onLayoutChange = function(layout) {}
	
	this.handleNavBar = function(target) {
		if (target == 'btnBack') {
			this._controller.pop();
		}
	}
	
	this.onBeforeShow = function() {
		
	}
	
	this.onShow = function() {}
	this.onBeforeHide = function() {}
	this.onHide = function() {}
	
	this.onClick = function(e) {
		this.onInputSelect((e.target || e.srcElement).id, e);
	}
	
	this.show = function() { $.show(this._el); }
	this.hide = function() { $.hide(this._el); }
});

exports.NavBar = Class(Widget, function(supr) {
	
	this.init = function(opts) {
		opts = merge(opts, {title: ''});
		
		this._def = {
			className: 'navBar',
			children: [
				{id: 'btnBack', className: 'navBarBackBtn', type: 'button', label: '\u25C0 back'},
				{id: 'title', type: 'label', label: opts.title, className: 'navBarTitle'}
			]
		};
		
		supr(this, 'init', arguments);
	}
	
	this.setTitle = function(title) { this.title.setLabel(title); }
	
	this.onInputSelect = function(target) {
		this._delegate(target);
	}
	
	this.showBackBtn = function(show) {
		if (show) {
			$.show(this._backBtn.getElement());
		} else {
			$.hide(this._backBtn.getElement());
		}
	}
});
