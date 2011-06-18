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
				before: this._el.firstChild
			});
		}
		
		this._scrollTop = 0;
		this.initDragEvents();
		
		this._lastDelta = {
			diff: 0,
			when: 0,
			duration: 0
		};
		
		if (this._el.addEventListener) {
			this._el.addEventListener('touchstart', bind(this, 'onTouchStart'), true);
		}
		
		return supr(this, 'buildContent', arguments);
	}
	
	this.onLayoutChange = function(layout) {}
	
	this.onBeforeShow = function() {
		
	}
	
	this.onShow = function() {}
	this.onBeforeHide = function() {}
	this.onHide = function() {}
	
	this.onTouchStart = function() {
		if (this._momentum) { clearInterval(this._momentum); }
	}
	
	this.onDragStart = function(dragEvt, mouseEvt) {
		this._height = this._el.offsetHeight - this._el.parentNode.offsetHeight;
		this._lastDelta.when = +new Date();
		if (this._momentum) { clearInterval(this._momentum); }
	}
	
	this.onDrag = function(dragEvt, moveEvt, delta) {
		var now = +new Date(),
			d = this._lastDelta;
		
		d.diff = delta.y;
		d.duration = d.when && (now - d.when) || 0;
		d.when = now;
		
		this.scrollTo(this._scrollTop + delta.y);
	}
	
	this.scrollTo = function(y) {
		this._scrollTop = y;
		if (this._scrollTop > 0) { this._scrollTop = 0; }
		if (this._scrollTop < -this._height) { this._scrollTop = -this._height; }
		this._el.style.webkitTransform = 'translate3d(0,' + this._scrollTop + 'px,0)';
	}
	
	this.onDragStop = function(dragEvt, selectEvt) {
		if (this._lastDelta.duration != 0) {
			var d = this._lastDelta,
				speed = d.diff / d.duration,
				start = d.when,
				time = d.when,
				dir = speed > 0 ? 1 : -1,
				dur = 2;
			
			this._momentum = setInterval(bind(this, function() {
				var now = +new Date(),
					dt = now - time,
					distance = speed * dt;
				
				this.scrollTo(this._scrollTop + distance);
				
				// TODO: this isn't based on dt which is bad!!!
				speed *= 0.95;
				if (Math.abs(speed) < 0.01) {
					clearTimeout(this._momentum);
					this._momentum = null;
				}
				time = now;
			}), 10);
		}
	}
	
	this.show = function() { $.show(this._el); }
	this.hide = function() { $.hide(this._el); }
});

exports.NavBar = Class(Widget, function(supr) {
	
	this.init = function(opts) {
		opts = merge(opts, {title: ''});
		
		this.menu = opts.parent;
		
		this._def = {
			className: 'navBar',
			children: [
				{id: 'btnBack', className: 'navBarBackBtn', type: 'button', label: '\u25C0 back'},
				{type: 'label', label: opts.title, className: 'navBarTitle'}
			]
		};
		
		supr(this, 'init', arguments);
	}
	
	this.onInputSelect = function(target) {
		if (target == 'btnBack') {
			this.menu._controller.pop();
		}
	}
	
	this.showBackBtn = function(show) {
		if (show) {
			$.show(this._backBtn.getElement());
		} else {
			$.hide(this._backBtn.getElement());
		}
	}
});
