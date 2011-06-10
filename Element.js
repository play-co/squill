jsio('import lib.PubSub');
jsio('import std.js as JS');
jsio('from util.browser import $');

var Element = exports = Class(lib.PubSub, function(supr) {
	this.init = function(params) {
		this._params = JS.merge(params, {
			win: window,
			tag: 'div'
		});
	}
	
	this.build = function() {
		if (!this._el) {
			if (this._params.el) {
				this._el = this._params.el;
				$.apply(this._el, this._params);
			} else {
				this._el = $.create(this._params);
			}
		
			this.buildContent();
		}
		
		return this;
	}
	
	this.getId = function() { return this._el && this._el.id || this._params && this._params.id; }
	
	this.buildContent = function() {}
	
	this.destroy = function() {
		if (!this._el) { return; }
	}
	
	this.getElement = function() { return this._el || this.build()._el; }
	
	this.appendChild = function(el) {
		if (!this._el) { this.build(); }
		this._el.appendChild(el instanceof Element ? el._el : el);
		
		return this;
	}
	
	this.appendTo = function(el) {
		if (!this._el) { this.build(); }
		
		if (el instanceof Element) {
			el.appendChild(this);
		} else {
			el.appendChild(this._el);
		}
		
		return this;
	}
	
	this.setPos = function(x, y) {
		this._el.style.x = x + 'px';
		this._el.style.y = y + 'px';
	}
	
	this.center = function() {
		var dim = $(window);
		this.setPos(Math.max(0, dim.width - this._el.offsetWidth) / 2, Math.max(0, dim.height - this._el.offsetHeight) / 2);
	}
	
	this.remove = function() { $.remove(this._el); }
});
