"use import";

import .Drag;
import .Widget;
import .transforms;
from util.browser import $;

exports = Class(Widget, function(supr) {
	this._css = 'scroller';
	
	this.init = function(opts) {
		opts = merge(opts, {
			momentum: true
		});
		
		this._scrollTop = 0;
		this._lastDelta = {
			diff: 0,
			when: 0,
			duration: 0
		};
		
		this._hasMomentum = opts.momentum;
		
		supr(this, 'init', [opts]);
	}
	
	this.buildContent = function() {
		var el = this._el;
		
		$.style(el, {height: '100%'});
		
		this._scrollPane = $({
			parent: el,
			className: 'squill-scrollPane',
			minHeight: '100%'
		});
		
		if ('ontouchstart' in el) {
			el.addEventListener('touchstart', bind(this, 'onTouchStart'), true);
			el.addEventListener('mousedown', this, 'start')
			this.initDragEvents();
			this._el.style.overflow = 'hidden';
			transforms.setTop(this._scrollPane, 0);
		} else {
			this._el.style.overflow = 'auto';
		}
		
		if (this._def) {
			var def = this._def;
			this._def = null; // don't handle it in the supr call
			
			// build children into the scroll pane
			this.buildChildren(merge({el: this._scrollPane}, def));	
		}
		
		return supr(this, 'buildContent', arguments);
	}
	
	this.getScrollTop = function() { return this._scrollTop; }
	this.getContainer = 
	this.getScrollPane = function() { return this._scrollPane; }
	
	this.onTouchStart = function() {
		if (this._momentum) { clearInterval(this._momentum); }
	}

	this.onDragStart = function(dragEvt, mouseEvt) {
		this._height = this._scrollPane.offsetHeight - this._el.offsetHeight;
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

	this.scrollTo = function(y, animate) {
		this._scrollTop = y;
		if (this._scrollTop < -this._height) { this._scrollTop = -this._height; }
		if (this._scrollTop > 0) { this._scrollTop = 0; }
		
		this._el.setAttribute('squill-scroller-top', -this._scrollTop);
		
		var onFinish = bind(this, function() {
			if (document.createEvent) {
				var e = document.createEvent('HTMLEvents');
				e.initEvent('scroll', true, false);
				this._el.dispatchEvent(e);
			}
		});
		
		if (animate) {
			transforms.move(this._scrollPane, 0, this._scrollTop, '0.5s ease-in-out', onFinish);
		} else {
			transforms.move(this._scrollPane, 0, this._scrollTop);
			onFinish();
		}
	}
	
	this.onDragStop = function(dragEvt, selectEvt) {
		$.stopEvent(selectEvt);
		if (this._hasMomentum && this._lastDelta.duration != 0) {
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
});
