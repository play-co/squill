"use import";

import .Button, .Widget;
from util.browser import $;

var TextButton = exports = Class(Button, function(supr) {
	this._type = 'text-button';
	
	this.buildWidget = function() {
		var el = this._el;
		$.setText(el, this.getI18n('label') || this.getI18n('text'));
		
		this.initMouseEvents(el);
		this.initKeyEvents(el);
	}
	
	this.setLabel = function(label) {
		this._opts.label = label;
		if(this._el) { $.setText(this._el, label); }
	}
});

Widget.register(TextButton, 'TextButton');
