"use import";

from util.browser import $;
import .Widget;

var Slider = exports = Class(Widget, function(supr) {
	this._css = 'rng';
	this._type = 'range';

	this.init = function(params) {
		this._width = params.width || 100;

		this._def = {
			children: [
				{
					id: params.id + 'Canvas',
					tag: 'canvas',
					attrs: {width: this._width, height: '20'}
				}
			]
		};

		supr(this, 'init', [params]);
	};

	this._render = function() {
		var ctx = this._ctx,
			radialGradient,
			v;

		ctx.clearRect(0, 0, this._width, 20);

		ctx.lineCap = 'round';

		ctx.lineWidth = 6;
		ctx.beginPath();
		ctx.moveTo(7, 10);
		ctx.lineTo(this._width - 7, 10);
		ctx.strokeStyle = '#404040';
		ctx.stroke();

		ctx.lineWidth = 4;
		ctx.beginPath();
		ctx.moveTo(8, 12);
		ctx.lineTo(this._width - 7, 12);
		ctx.strokeStyle = '#A0A0A0';
		ctx.stroke();

		ctx.lineWidth = 3;
		ctx.beginPath();
		ctx.moveTo(6, 10);
		ctx.lineTo(this._width - 6, 10);
		ctx.strokeStyle = '#808080';
		ctx.stroke();

		v = ~~((this._width - 10) * (this.value - this.min) / (this.max - this.min)),

		ctx.beginPath();
		ctx.arc(5 + v, 10, 5, 0, Math.PI * 2, false);
		ctx.closePath();

		radialGradient = ctx.createRadialGradient(4 + v, 9, 0, 5 + v, 10, 4);

		radialGradient.addColorStop(0, '#FFFFFF');
		radialGradient.addColorStop(1, '#000000');
		ctx.fillStyle = radialGradient;
		ctx.fill();
	};

	this.buildWidget = function() {
		var el = this._el;
			canvas = el.firstChild;

		el.slider = this;

		$.onEvent(canvas, 'mouseout', this, '_onMouseOut');
		$.onEvent(canvas, 'mousedown', this, '_onMouseDown');
		$.onEvent(canvas, 'mouseup', this, '_onMouseUp');
		$.onEvent(canvas, 'mousemove', this, '_onMouseMove');

		this.min = this._opts.min || 0;
		this.max = this._opts.max || 100;
		this.step = this._opts.step || 1;
		this.value = this._opts.value || 0;

		this._mouseDown = false;
		this._checkRange();
		this._ctx = canvas.getContext('2d');
		this._render();
	};

	this.setValue = function(value) {
		this.value = value;
		this._render();
	};

	this._onChange = function() {
		this.publish('Change', this.value);
	};

	this._checkRange = function() {
		if (this.value < this.min) {
			this.value = this.min;
		}
		if (this.value > this.max) {
			this.value = this.max;
		}
	};

	this._checkMouse = function(evt) {
		var value;

		if (this._mouseDown) {
			if ((evt.offsetX > 5) && (evt.offsetY > 5) && (evt.offsetX < this._width - 5) && (evt.offsetY < 15)) {
				value = (evt.offsetX - 5) / (this._width - 10) * (this.max - this.min);
				value = this.min + Math.round(value / this.step) * this.step;
				this.value = value;
				this._checkRange();
				this._render();
				this._onChange();
			}
		}
	};

	this._onMouseOut = function(evt) {
		this._mouseDown = false;
	};

	this._onMouseDown = function(evt) {
		this._mouseDown = true;
		this._checkMouse(evt);
	};
	
	this._onMouseUp = function(evt) {
		this._mouseDown = false;
	};
	
	this._onMouseMove = function(evt) {
		this._checkMouse(evt);
	};
});

