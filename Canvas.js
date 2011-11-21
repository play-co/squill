"use import";

from util.browser import $;
import .Widget;

var Canvas = exports = Class(Widget, function(supr) {
	this._css = 'cnvs';
	this._type = 'canvas';
	
	this.init = function(params) {
		params = merge(params, {tag: 'canvas'});
		this._isEnabled = params.isEnabled;
		supr(this, 'init', [params]);
	}
	
	this.create = function() {
		supr(this, 'create', arguments);
	};
	
	this.buildWidget = function() {
		var el = this._el;

		el.width = this._opts.width;
		el.height = this._opts.height;
		if (this._opts.color) {
			el.style.backgroundColor = this._opts.color;
		}

		this.initMouseEvents(el);
		this.initKeyEvents(el);
	};
});

