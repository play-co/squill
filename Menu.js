"use import";

import .Widget;
import .Scroller;
import .TextButton;
import .Label;
import .Delegate;

from util.browser import $;
import util.Animation;

exports = Class(Scroller, function(supr) {
	// this.init = function(params) {
	// 	var params = JS.merge(params, {parent: $.id('wrapper')});
	// 	supr(this, 'init', [params]);
	// }
	
	// the default menu delegate just forwards to the menu controller
	this.delegate = new Delegate(function(on) {
		on.call = function(ctx, name) {
			var delegate = ctx.controller.delegate;
			delegate.call.apply(delegate, [ctx.controller].concat(Array.prototype.slice.call(arguments, 1)));
		}
	});
	
	this.buildContent = function() {
		$.apply(this._el, {
			className: 'menu'
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
			this.controller.pop();
		}
	}
	
	this.onBeforeShow = function() {
		if (this._nav) {
			this._scrollPane.style.marginTop = this._nav.getElement().offsetHeight + 'px';
		}
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
		
		this._hide = new util.Animation({
			duration: 500,
			subject: bind(this, function(t) {
				var height = this._el.offsetHeight;
				this._parent._scrollPane.style.marginTop = (height * (1 - t)) + 'px';
				this._el.style.top = -(height * t) + 'px';
			})
		});
		
		supr(this, 'init', arguments);
	}
	
	this.hide = function() { this._hide.seekTo(1); }
	this.show = function() { this._hide.seekTo(0); }
	
	this.setTitle = function(title) { this.title.setLabel(title); }
	
	this.showBackBtn = function(show) {
		if (show) {
			$.show(this._backBtn.getElement());
		} else {
			$.hide(this._backBtn.getElement());
		}
	}
});
