jsio('import .Button, .Widget');
jsio('from util.browser import $');

var TextButton = exports = Class(Button, function(supr) {
	this._type = 'text-button';
	
	this.buildWidget = function() {
		var el = this._el,
			label = this._params.label || '';
		
		$.setText(el, label);
		
		
		this.initMouseEvents(el);
		this.initKeyEvents(el);
	}
	
	this.setLabel = function(label) {
		this._params.label = label;
		if(this._center) { $.setText(this._center, label); }
	}
});

Widget.register(TextButton, 'TextButton');
