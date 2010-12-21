jsio("import .Widget");


var CheckBox = exports = Class(Widget, function(supr) {
	this.buildWidget = function() {
		this._label = $({
			tag: 'label',
			text: this._params.label,
			parent: this._el
		});
		
		this._checkbox = $({
			tag: 'input',
			attrs: {
				type: 'checkbox'
			},
			name: this._params.name,
			value: this._params.value,
			before: this._label.firstChild
		});
		
		this.initMouseEvents(this._checkbox);
		this.subscribe('Click', this, 'onClick');
	}
	
	this.onClick = function() {
		logger.info('checkbox clicked');
	}
			
	this.getValue = function() { return !!this._checkbox.value; }
});

Widget.register(CheckBox, 'CheckBox');
