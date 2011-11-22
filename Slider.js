"use import";

from util.browser import $;
import .Widget;

var Slider = exports = Class(Widget, function(supr) {
	this._css = 'rng';
	this._type = 'range';
	
	this.init = function(params) {
		params = merge(params, {tag: 'input'});
		this._isEnabled = params.isEnabled;
		supr(this, 'init', [params]);
	}
	
	this.create = function() {
		supr(this, 'create', arguments);
	};
	
	this.buildWidget = function() {
		var el = this._el;

		el.type = 'range';
		el.min = this._opts.min || 0;
		el.max = this._opts.max || 100;
		el.step = this._opts.step || 1;
		el.value = this._opts.value || 0;

		this.initMouseEvents(el);
		this.initKeyEvents(el);
	};
});

