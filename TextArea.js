jsio('import .Widget');

var TextArea = exports = Class(Widget, function(supr) {
	this.buildWidget = function() {
		this._label = $({
			tag: 'label',
			text: this._params.label,
			parent: this._el
		});
		
		this._textarea = $({
			tag: 'textarea',
			name: this._params.name,
			value: this._params.value,
			parent: this._label
		});
	}
});

Widget.register(TextArea, 'TextArea');