"use import";

import .Widget;
from util.browser import $;

var CheckBox = exports = Class(Widget, function(supr) {
	this._def = {
		tag: 'label',
		children: [
			{id: 'checkbox', tag: 'input', attrs: {type: 'checkbox'}},
			{tag: 'span', id: 'label', text: ''}
		]
	};
	
	this.buildWidget = function() {
		this.setLabel(this._params.label || '');
		if (this._params.name) {
			this.setName(this._params.name);
		}
		
		if (this._params.value) {
			this.setValue(this._params.value);
		}
		
		this.initMouseEvents(this.checkbox);
	}
	
	this.setLabel = function(label) { $.setText(this.label, label); }
	this.setName = function(name) { this.checkbox.name = name; }
	this.setValue = function(value) { this.checkbox.value = value; }

	this.isChecked = function() { return this.checkbox.checked; }
	this.setChecked = function(isChecked) { this.checkbox.checked = isChecked; }
	
	this.getValue = function() { return this.checkbox.value; }
});
