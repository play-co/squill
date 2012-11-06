"use import";

from util.browser import $;
import .Widget;

import .jscolor.jscolor as jscolor;

var Color = exports = Class(Widget, function(supr) {
	this._css = 'clr';
	this._type = 'text';

	this.init = function(params) {
		params = merge(params, {tag: 'input'});
		this._isEnabled = params.isEnabled;

		supr(this, 'init', [params]);

	};

	this.buildWidget = function() {
		var el = this._el;

		$.addClass(el, 'squill-color');
		el.min = this._opts.min || 0;
		el.max = this._opts.max || 100;
		el.step = this._opts.step || 1;
		el.value = this._opts.value || 0;
		el.onchange = bind(this, this._onChange);

		jscolor.bind(el);
	};

	this.setValue = function(value) {
		if (value) {
			if (value[0] !== '#') {
				value = '#' + value;
			}
			this._el.style.backgroundColor = value;

			value = value.substr(1, 6);
		}
		this._el.value = value;
	};

	this.getValue = function() {
		return this._el.value;
	};

	this._onChange = function() {
		this.publish('Change', this._el.value);
	};
});

