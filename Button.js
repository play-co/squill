"use import";

from util.browser import $;
import .Widget;

import .hint as hint;

var Button = exports = Class(Widget, function(supr) {
	this._css = 'btn';
	this._type = 'button';

	this.init = function(params) {
		params = merge(params, {tag: 'button', isEnabled: true});
		this._isEnabled = params.isEnabled;
		supr(this, 'init', [params]);
		this._hint = params.hint;
	};

	this.create = function() {
		this._opts.style = JS.merge(this._opts.style, {
				whiteSpace: 'nowrap',
				display: 'block'
			});
		
		supr(this, 'create', arguments);
	};

	this.buildWidget = function() {
		var el = this._el;
		
		this.initMouseEvents(el);
		this.initKeyEvents(el);
		
		el.style.userSelect = 'none';
		el.style.MozUserSelect = 'none'; // Mozilla
		el.style.KhtmlUserSelect = 'none'; // Safari
		el.unselectable = 'on'; // IE
	};

	this._setHintTimeout = function(e) {
		if (!this._hint) {
			return;
		}
		this._hintTimeout && clearTimeout(this._hintTimeout);
		this._hintTimeout = setTimeout(
			bind(
				this,
				function() {
					hint.show(e.pageX + 12, e.pageY + 14, this._hint);
				}
			),
			300
		);
	};

	this.onMouseOver = function(e) {
		this._setHintTimeout(e);
	};

	this.onMouseMove = function(e) {
		this._setHintTimeout(e);
	};

	this.onMouseOut = function(e) {
		hint.hide();
		this._hintTimeout && clearTimeout(this._hintTimeout);
	};

	this.onClick = function(e) {
		$.stopEvent(e);
		if (!this._isEnabled) { return; }

		if (this._opts.onClick) {
			this._opts.onClick(e, this);
		}
		
		supr(this, 'onClick', arguments);
	};

	this.captureOnEnter = function(widget) {
		widget.subscribe('KeyDown', this, 'onKeyDown');
		widget.subscribe('KeyUp', this, 'onKeyUp');
	};

	this.onKeyDown = function(e) {
		if (e.keyCode == 13) { $.stopEvent(e); this.onMouseDown(); }
	};

	this.onKeyUp = function(e) {
		if (e.keyCode == 13) { $.stopEvent(e); this.onMouseUp(); this.onClick(e); }
	};
	
	this.show = function() {
		this.onBeforeShow();
		this.getElement().style.display = 'inline-block';
		this.onShow();
	};

	this.setEnabled = function(isEnabled) {
		if (this._isEnabled != isEnabled) {
			this._isEnabled = isEnabled;
			if (!isEnabled) {
				$.addClass(this._el, 'disabled')
			} else {
				$.removeClass(this._el, 'disabled')
			}
		}
	};
});

