jsio('import .Widget');
jsio('from util.browser import $');

var PillButtons = exports = Class(Widget, function(supr) {

	var defaults = {
		className: 'pillButtons',
	};

	this.init = function (opts) {
		opts = merge(opts, defaults);
		supr(this, 'init', [opts]);
	}
	
	this.buildWidget = function(el) {
		this._options = {};
		
		var opts = this._opts.options,
			len = opts.length;
		for (var i = 0; i < len; ++i) {
			var optionEl = $({
				text: opts[i].text,
				className: 'pillBtnSegment',
				parent: el
			});
			
			if (opts[i].selected) {
				$.addClass(optionEl, 'selected');
				this._selected = {
					optionEl: optionEl,
					value: opts[i].value
				};
			}
			
			$.onEvent(optionEl, 'mousedown', this, 'onSelect', optionEl, opts[i].value);
			this._options[opts[i].value] = optionEl;
		}
	}
	
	this.setValue = function(value) {
		this.onSelect(this._options[value], value);
	}
	
	this.onSelect = function(optionEl, value, evt) {
		if (value === this._selected.value) { return; }
		
		$.removeClass(this._selected.optionEl, 'selected');
		$.addClass(optionEl, 'selected');
		
		this._selected = {
			optionEl: optionEl,
			value: value
		};
		
		this.publish('Select', value);
	}
});
