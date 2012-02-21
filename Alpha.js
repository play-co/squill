"use import";

from util.browser import $;
import .Widget;

import .jscolor.jscolor as jscolor;

var alphaSelect = false,
	alphaIndicator;

var Alpha = exports = Class(Widget, function(supr) {
	this._css = 'lph';
	this._type = 'text';

	this.init = function(params) {
		params = merge(params, {tag: 'input'});
		supr(this, 'init', [params]);
	};

	this.buildWidget = function() {
		var el = this._el;

		el.widget = this;

		$.onEvent(el, 'focus', this, '_onFocus');
		$.onEvent(el, 'blur', this, '_onBlur');
		$.onEvent(el, 'change', this, '_onChange');

		var alphaGradient,
			ctx,
			style,
			rect;

		if (!alphaSelect) {
			alphaSelect = document.createElement('div');
			alphaSelect.style.display = 'none';
			alphaSelect.className = 'colorMenu';
			document.body.appendChild(alphaSelect);

			$.onEvent(alphaSelect, 'mousedown', this, '_onSelect');

			alphaGradient = document.createElement('canvas');
			alphaGradient.width = 20;
			alphaGradient.height = 100;
			alphaSelect.appendChild(alphaGradient);

			$.style(
				alphaGradient,
				{
					'float': 'left',
					width: '20px',
					height: '100px',
					margin: '8px 0 0 12px',
					border: '1px solid #000',
					borderColor: 'ThreeDShadow ThreeDHighlight ThreeDHighlight ThreeDShadow',
					backgroundColor: 'red'
				}
			);
			$.onEvent(alphaGradient, 'mousedown', this, '_onMouseDown');
			$.onEvent(alphaGradient, 'mousemove', this, '_onMouseMove');
			$.onEvent(alphaGradient, 'mouseup', this, '_onMouseUp');
			$.onEvent(alphaGradient, 'mouseout', this, '_onMouseOut');

			alphaIndicator = document.createElement('img');
			alphaIndicator.src = 'img/colorpicker/arrow.gif';
			alphaSelect.appendChild(alphaIndicator);

			$.style(
				alphaIndicator,
				{
					position: 'absolute',
					left: '4px',
					top: '2px',
					border: '0px hidden'
				}
			);

			ctx = alphaGradient.getContext('2d');
			linearGradient = ctx.createLinearGradient(0, 0, 0, 100);
			linearGradient.addColorStop(0, '#FFFFFF');
			linearGradient.addColorStop(1, '#000000');
			ctx.fillStyle = linearGradient;
			ctx.fillRect(0, 0, 20, 100);
		}
	};

	this._showIndicator = function(alpha) {
		if (alpha < 0) {
			alpha = 0;
		}
		if (alpha > 100) {
			alpha = 100;
		}

		$.style(
			alphaIndicator,
			{
				position: 'absolute',
				left: '4px',
				top: (2 + alpha) + 'px',
				border: '0px hidden'
			}
		);

		return alpha;
	};

	this._showMouseAlpha = function(evt) {
		alphaSelect.target.value = 100 - this._showIndicator(evt.offsetY);
		alphaSelect.widget.publish('Change', parseInt(alphaSelect.target.value, 10));
	};

	this._onChange = function(evt) {
		var value = this._el.value;
		if (!isNaN(value)) {
			value = parseInt(value, 10);
			if ((value >= 0) && (value <= 100)) {
				alphaSelect.widget.publish('Change', value);
			}
		}
	};

	this._onFocus = function(evt) {
		var alpha,
			style = alphaSelect.style,
			rect = this._el.getBoundingClientRect(),
			x = rect.right + 4,
			y = rect.top;

		if (y + 122 > window.innerHeight) {
			y = rect.bottom - 122;
		}
		if (x + 44 > window.innerWidth) {
			x = rect.left - 48;
		}

		$.style(
			alphaSelect,
			{
				position: 'absolute',
				width: '44px',
				height: '122px',
				zIndex: '1000000',
				left: x + 'px',
				top: y + 'px',
				display: 'block'
			}
		);

		alphaSelect.widget = evt.target.widget;
		alphaSelect.target = evt.target;

		if (isNaN(alphaSelect.target.value)) {
			alpha = 0;
		} else {
			alpha = parseInt(alphaSelect.target.value, 10);
		}
		this._showIndicator(100 - alpha);
	};

	this._onBlur = function(evt) {
		alphaSelect.style.display = 'none';
	};

	this._onSelect = function(evt) {
		$.stopEvent(evt);
	};

	this._onMouseDown = function(evt) {
		$.stopEvent(evt);
		this._showMouseAlpha(evt);
		this._mouseDown = true;
	};

	this._onMouseMove = function(evt) {
		if (this._mouseDown) {
			this._showMouseAlpha(evt);
		}
		$.stopEvent(evt);
	};

	this._onMouseOut = function(evt) {
		this._mouseDown = false;
		$.stopEvent(evt);
	};

	this._onMouseUp = function(evt) {
		this._mouseDown = false;
		$.stopEvent(evt);
	};

	this.setValue = function(value) {
		this._el.value = value;
	};

	this.getValue = function() {
		return this._el.value;
	};
});

