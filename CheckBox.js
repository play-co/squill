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
		this.setLabel(this._opts.label || '');
		if (this._opts.name) {
			this.setName(this._opts.name);
		}
		
		if (this._opts.value) {
			this.setValue(this._opts.value);
		}
		
		this.initMouseEvents(this.checkbox);
		$.onEvent(this.checkbox, 'change', this, '_onCheck');

		if (this._opts.__result) {
			this._opts.__result.addSubscription(this, 'Select', this._opts.id);
		}
	}
	
	this._onCheck = function() {
		this.publish('Check', this.isChecked());
		this.emit('change', this.isChecked());
	}
	
	this.setLabel = function (label) { $.setText(this.label, label); }
	this.setName = function (name) { this.checkbox.name = name; }
	this.setValue = function (value) { this.checkbox.checked = !!value; }

	this.isChecked = function () { return this.checkbox.checked; }
	this.setChecked = function (isChecked) { this.checkbox.checked = isChecked; }
	
	this.getValue = function () { return this.isChecked() ? this.checkbox.value : null; }
});
