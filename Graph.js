"use import";

from util.browser import $;
import .Widget;

var Graph = exports = Class(Widget, function(supr) {
	this._css = 'cnvs';
	this._type = 'canvas';
	
	this.init = function(opts) {
		params = merge(opts, {tag: 'canvas'});
		supr(this, 'init', arguments);

		this.setSettings(opts.settings || {});

		this._width = opts.width || 400;
		this._height = opts.height || 400;
	};

	this.buildWidget = function() {
		var el = this._el;

		this.initMouseEvents(el);
		this.initKeyEvents(el);
	};

	this._renderBackground = function(ctx) {
		var el = this._el,
			width = el.width,
			height = el.height;

		this._currentWidth = width;
		this._currentHeight = height;

		ctx.fillStyle = this._settings.fillColor;
		ctx.fillRect(0, 0, width, height);
	};

	this._calculateSegments = function(data) {
		var max = 0,
			i, j = data.length;

		for (i = 0; i < j; i++) {
			item = data[i];
			max = Math.max(item.points[0], max);
		}

		var steps = [0.5, 0.25, 0.2, 0.1],
			stepIndex = 0,
			stepCount,
			factor = 1;

		while (max / (steps[stepIndex] * factor) > 10) {
			stepIndex++;
			if (stepIndex >= steps.length) {
				stepIndex = 0;
				factor *= 10;
			}
		}

		stepCount = Math.ceil(max / (steps[stepIndex] * factor));
		return {
			steps: stepCount,
			step: steps[stepIndex],
			max: stepCount * steps[stepIndex] * factor,
			factor: factor
		}
	};

	this._renderHorizontalAxis = function(ctx, segmentInfo) {
		var settings = this._settings,
			valueSpace = settings.valueSpace,
			mainPadding = settings.mainPadding,
			width = this._currentWidth - mainPadding * 2 - valueSpace,
			height = this._currentHeight - mainPadding * 2,
			x, y,
			i, j;

		ctx.strokeStyle = '#DDDDDD';
		for (i = 0; i < 2; i++) {
			x = valueSpace + mainPadding + 0.5 + i * width;
			ctx.beginPath();
			ctx.moveTo(x, mainPadding);
			ctx.lineTo(x, mainPadding + height);
			ctx.stroke();
		}

		ctx.strokeStyle = '#000000';
		ctx.fillStyle = '#000000';

		ctx.font = '12px Verdana';
		ctx.textAlign = 'right';
		ctx.textBaseline = 'top';

		i = height;
		j = 0;
		while (i >= 0) {
			x = mainPadding + valueSpace;
			y = mainPadding + ~~i + 0.5;
			ctx.beginPath();
			ctx.moveTo(x, y);
			ctx.lineTo(x + width, y);
			ctx.stroke();

			ctx.fillText(j * segmentInfo.step * segmentInfo.factor, valueSpace + mainPadding - 2, mainPadding + i - 8);

			i = Math.ceil(i - height / segmentInfo.steps);
			j++;
		}
	};

	this._renderVerticalBar = function(ctx, data) {
		var segmentInfo = this._calculateSegments(data),
			settings = this._settings,
			valueSpace = settings.valueSpace,
			mainPadding = settings.mainPadding,
			width = this._currentWidth - mainPadding * 2 - valueSpace,
			height = this._currentHeight - mainPadding * 2,
			step = width / data.length,
			barWidth = step - settings.barPadding * 2,
			barHeight,
			barX,
			item,
			i, j;

		this._renderHorizontalAxis(ctx, segmentInfo);

		ctx.globalAlpha = 0.9;
		ctx.fillStyle = '#FF0000';
		for (i = 0, j = data.length; i < j; i++) {
			item = data[i];

			barHeight = item.points[0] / segmentInfo.max * height;
			barX = valueSpace + mainPadding + i * step + settings.barPadding;
			barY = mainPadding + height - barHeight;

			ctx.fillRect(barX, barY, barWidth, barHeight);
		}

		ctx.globalAlpha = 1;
	};

	this._renderVerticalPoints = function(ctx, data) {
		var segmentInfo = this._calculateSegments(data),
			settings = this._settings,
			valueSpace = settings.valueSpace,
			mainPadding = settings.mainPadding,
			width = this._currentWidth - mainPadding * 2 - valueSpace,
			height = this._currentHeight - mainPadding * 2,
			step = width / data.length,
			pointWidth = step - settings.barPadding * 2,
			pointX, pointY,
			pointXLast, pointYLast,
			item,
			i, j;

		this._renderHorizontalAxis(ctx, segmentInfo);

		pointXLast = null;

		ctx.strokeStyle = '#FF0000';
		for (i = 0, j = data.length; i < j; i++) {
			item = data[i];

			pointX = valueSpace + mainPadding + i * step + settings.barPadding + (pointWidth / 2);
			pointY = mainPadding + height - item.points[0] / segmentInfo.max * height;

			ctx.strokeRect(pointX - 4.5, pointY - 4.5, 10, 10);
			
			if (pointXLast !== null) {
				ctx.beginPath();
				ctx.moveTo(pointXLast, pointYLast);
				ctx.lineTo(pointX, pointY);
				ctx.stroke();
			}

			pointXLast = pointX;
			pointYLast = pointY;
		}
	};

	this._renderVerticalAxis = function(ctx, segmentInfo) {
		var settings = this._settings,
			valueSpace = settings.valueSpace,
			mainPadding = settings.mainPadding,
			width = this._currentWidth - mainPadding * 2,
			height = this._currentHeight - mainPadding * 2 - valueSpace,
			x, y,
			i, j;

		ctx.strokeStyle = '#DDDDDD';
		for (i = 0; i < 2; i++) {
			y = mainPadding + 0.5 + i * height;
			ctx.beginPath();
			ctx.moveTo(mainPadding, y);
			ctx.lineTo(mainPadding + width, y);
			ctx.stroke();
		}

		ctx.strokeStyle = '#000000';
		ctx.fillStyle = '#000000';

		ctx.font = '12px Verdana';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'top';

		i = 0;
		j = 0;
		while (i <= width) {
			x = mainPadding + ~~i + 0.5;
			y = mainPadding;
			ctx.beginPath();
			ctx.moveTo(x, y);
			ctx.lineTo(x, y + height);
			ctx.stroke();

			ctx.fillText(j * segmentInfo.step * segmentInfo.factor, mainPadding + i, mainPadding + height + 2);

			i = Math.floor(i + width / segmentInfo.steps);
			j++;
		}
	};

	this._renderHorizontalBar = function(ctx, data) {
		var segmentInfo = this._calculateSegments(data),
			settings = this._settings,
			valueSpace = settings.valueSpace,
			mainPadding = settings.mainPadding,
			width = this._currentWidth - mainPadding * 2,
			height = this._currentHeight - mainPadding * 2 - valueSpace,
			step = height / data.length,
			barWidth,
			barHeight = step - settings.barPadding * 2,
			barX, barY,
			item,
			i, j;

		this._renderVerticalAxis(ctx, segmentInfo);

		ctx.globalAlpha = 0.9;
		ctx.fillStyle = '#FF0000';
		for (i = 0, j = data.length; i < j; i++) {
			item = data[i];

			barWidth = item.points[0] / segmentInfo.max * width;
			barX = mainPadding;
			barY = mainPadding + i * step + settings.barPadding;

			ctx.fillRect(barX, barY, barWidth, barHeight);
		}

		ctx.globalAlpha = 1;
	};

	this._renderHorizontalPoints = function(ctx, data) {
		var segmentInfo = this._calculateSegments(data),
			settings = this._settings,
			valueSpace = settings.valueSpace,
			mainPadding = settings.mainPadding,
			width = this._currentWidth - mainPadding * 2,
			height = this._currentHeight - mainPadding * 2 - valueSpace,
			step = height / data.length,
			pointHeight = step - settings.barPadding * 2,
			pointX, pointY,
			item,
			i, j;

		this._renderVerticalAxis(ctx, segmentInfo);

		pointXLast = null;

		ctx.strokeStyle = '#FF0000';
		for (i = 0, j = data.length; i < j; i++) {
			item = data[i];

			pointX = mainPadding + item.points[0] / segmentInfo.max * width;
			pointY = mainPadding + i * step + settings.barPadding + pointHeight / 2;

			ctx.strokeRect(pointX - 4.5, pointY - 4.5, 10, 10);
			
			if (pointXLast !== null) {
				ctx.beginPath();
				ctx.moveTo(pointXLast, pointYLast);
				ctx.lineTo(pointX, pointY);
				ctx.stroke();
			}

			pointXLast = pointX;
			pointYLast = pointY;
		}

		ctx.globalAlpha = 1;
	};

	this.setData = function(data) {
		var el = this._el,
			ctx = el.getContext('2d'),
			renderMethod = function() {};

		switch (this._settings.orientation) {
			case 'horizontal-bar':
				el.width = data.length * 30 + this._settings.valueSpace;
				el.height = this._height;
				renderMethod = bind(this, this._renderHorizontalBar);
				break;

			case 'vertical-bar':
				el.width = this._width;
				el.height = data.length * 30 + this._settings.valueSpace;
				renderMethod = bind(this, this._renderVerticalBar);
				break;

			case 'horizontal-points':
				el.width = this._width;
				el.height = data.length * 30 + this._settings.valueSpace;
				renderMethod = bind(this, this._renderHorizontalPoints);
				break;

			case 'vertical-points':
				el.width = this._width;
				el.height = data.length * 30 + this._settings.valueSpace;
				renderMethod = bind(this, this._renderVerticalPoints);
				break;
		}

		this._renderBackground(ctx);

		if (data.length) {
			renderMethod(ctx, data);
		}
	};

	this.setSettings = function(settings) {
		settings.fillColor = settings.fillColor || '#FFFFFF';
		settings.orientation = settings.oriantation || 'horizontal-points';
		settings.barPadding = settings.barPadding || 2;
		settings.mainPadding = settings.mainPadding || 10;
		settings.valueSpace = settings.valueSpace || 40;

		this._settings = settings;
	};
});

