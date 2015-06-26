from util.browser import $;
import squill.Widget;
import squill.models.bindings as bindings;

exports = Class(squill.Widget, function() {
	this._css = 'label';
	this._def = {
		children: [{
			id: '_labelSpan',
			tag: 'span'
		}]
	}

	this.buildWidget = function() {
		this.setLabel(this.getI18n('label'));

		var opts = this._opts;
		if (opts.format) {
			bindings.parseFormat(this, opts.format);
		}
	}

	this.setData =
	this.setValue =
	this.setLabel =
	this.setText = function(text) { $.setText(this._labelSpan, text); }
	this.setHTML = function(html) { this._labelSpan.innerHTML = html; }
});
