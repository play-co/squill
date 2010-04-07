jsio('from util.browser import $');

exports = Class(function() {
	this.init = function(params) {
		this._el = $.create(params);
	}
	
	this.setText = function(text) { $.setText(this._el, text); }
	this.setHTML = function(html) { this._el.innerHTML = html; }
});