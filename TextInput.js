jsio('from util.browser import $');
jsio('import .Widget, .global');

var TextInput = exports= Class(Widget, function(supr) {
	this._type = 'text';
	this._css = 'textInput';
	this._class = global.getWidgetPrefix() + this._css;
	
	this.buildWidget = function() {
		var el = this._el,
			type = this._params.type,
			label = this.getI18n('label') || '',
			value = this.getI18n('value') || '';
		
		$.style(el, {position: 'relative'});
		
		
		this._input = $.create({
			tag: 'input',
			attrs: {
				type: type || this._type,
				value: value,
				name: this._name
			},
			parent: el
		});
		
		if (this._input.getAttribute('placeholder') === null) {
			this._input.setAttribute('placeholder', label);
		} else {
			this._label = $.create({
				tag: 'button',
				text: label,
				className: global.getWidgetPrefix() + 'textInputLabel',
				style: {position: 'absolute'},
				parent: el
			});	
		}
		
		this.initMouseEvents(el);
		this.initFocusEvents(this._input);
		this.initKeyEvents(this._input);
	}
	
	this.setName = function(name) {
		supr(this, 'setName', arguments);
		
		if (this._input) { this._input.name = name; }
	}
	
	this.getValue = function() { return this._input.value; }
	
	this.onMouseDown = function(e) {
		supr(this, 'onMouseDown', arguments);
		this._input.focus();
	}
	
	this.onClick = function(e) {
		supr(this, 'onClick', arguments);
		
		var evt = document.createEvent("MouseEvents");
		evt.initMouseEvent("touchend", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
		this._input.dispatchEvent(evt);
	}
	
	this.onKeyDown = function() {
		supr(this, 'onKeyDown', arguments);
		if (this._label) { $.hide(this._label); }
	}
	
	this.onKeyUp = function() {
		supr(this, 'onKeyUp', arguments);
		this.checkLabel();
	}
	
	this.onBlur = function() {
		supr(this, 'onBlur');
		this.checkLabel();
	}
	
	this.checkLabel = function() {
		if(this._label && /^\s*$/.test(this._input.value)) {
			$.show(this._label);
		}
	}
});

Widget.register(TextInput, 'TextInput');
