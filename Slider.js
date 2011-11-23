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
	};

	this.buildWidget = function() {
		var el = this._el;

		el.type = 'range';
		el.min = this._opts.min || 0;
		el.max = this._opts.max || 100;
		el.step = this._opts.step || 1;
		el.value = this._opts.value || 0;
		el.onchange = bind(this, this._onChange);

		this.initMouseEvents(el);
		this.initKeyEvents(el);
	};

	this.setValue = function(value) {
		this._el.value = value;
	};

	this._onChange = function() {
		this.publish('Change', parseInt(this._el.value, 10));
	};
});

