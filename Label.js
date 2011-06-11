"use import";

from util.browser import $;
import squill.Widget;

exports = Class(squill.Widget, function() {
	this._css = 'label';
	
	this.buildWidget = function() {
		var el = this._el,
			label = this.getI18n('label') || '';
		
		$.setText(el, label);
	}
	
	this.setLabel =
	this.setText = function(text) { $.setText(this._el, text); }
	this.setHTML = function(html) { this._el.innerHTML = html; }
});
