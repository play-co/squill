"use import";

import .Widget;
from util.browser import $;

var Cell = exports = Class(Widget, function(supr) {
	this.init = function(opts) {
		supr(this, 'init', [opts]);
		
		if (opts.data) { this.setData(opts.data); }
	}
	
	this.buildWidget = function(el) {
		this.initMouseEvents();
	}

	this.isSelected = function() {
		return this._widgetParent.selection && this._widgetParent.selection.isSelected(this._data);
	};

	this.select = function() {
		this._widgetParent.selection && this._widgetParent.selection.select(this._data);
	};

	this.deselect = function() {
		this._widgetParent.selection && this._widgetParent.selection.deselect(this._data);
	};

	this.setData = function(data) {
		this._data = data; this.updateSelected();
	};

	this.getData = function() {
		return this._data;
	};

	this.render = function() {}

	this.onClick = this.onSelect = function() {
		if (!this._widgetParent.selection) { return; }

		var type = this._widgetParent.selection.getType();
		if (type == 'toggle' || type == 'multi') {
			if (this.isSelected()) {
				this.deselect();
			} else {
				this.select();
			}
		} else if (type == 'single') {
			this.select();
		}
	}
	
	this.updateSelected = function() {
		var isSelected = this.isSelected();
		if (isSelected) {
			$.addClass(this._el, 'selected');
		} else {
			$.removeClass(this._el, 'selected');
		}
		return isSelected;
	}
});

exports.Selectable = exports;
