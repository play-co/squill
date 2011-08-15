"use import";

import .Widget;
from util.browser import $;

var Cell = exports = Class(Widget, function() {
	this.setData = function(data) { this._data = data; }
	this.getData = function() { return this._data; }
	this.setParent = function(parent) { this._parent = parent; }
	this.render = function() {}
});

exports.Selectable = Class(Cell, function(supr) {
	this.buildWidget = function(el) {
		this.initMouseEvents();
	}
	
	this.isSelected = function() { return this._data.isSelected; }
	this._setSelected = function(isSelected) { this._data.isSelected = isSelected; }
	
	this.setData = function(data) {
		supr(this, 'setData', arguments);
		var isSelected = this.updateSelected();
		if (isSelected) {
			this._parent.setSelected(this._data);
		}
	}
	
	this.onDeselect = function() {
		this._onDeselect();
		this._parent.publish('Deselect', this._data);
	}
	
	this.onClick = 
	this.onSelect = function() {
		var prev = this._parent.getSelected(),
			cell = prev && this._parent.getCellById(prev[this._params.key]);
		
		if (cell) { cell.setSelected(false); }
		
		this.setSelected(true);
	}
	
	this.setSelected = function(isSelected) {
		if (this.isSelected() != isSelected) {
			if (isSelected) {
				this._parent.setSelected(this._data);
				this._parent.publish('Select', this._data);
			}
			
			this._setSelected(isSelected);
			this.updateSelected();
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
	
	this.render = function() {
		$.setText(this._el, this._data.id);
	}
});