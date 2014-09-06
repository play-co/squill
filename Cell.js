import .Widget;
from util.browser import $;

var Cell = exports = Class(Widget, function(supr) {

	this._css = 'cell';

	this.init = function (opts) {
		supr(this, 'init', arguments);

		if (opts.item) { this.setItem(opts.item); }
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

	this.setItem = function(item) {
		this._item = this._data = item; this.updateSelected();
	};

	this.getItem = function () { return this._item; };
	this.getData = function() { return this._item; };

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
