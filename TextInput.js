jsio('from util.browser import $');
jsio('import .Widget, .global');

var TextInput = exports = Class(Widget, function(supr) {
	this._type = 'text';
	this._css = 'textInput';
	this._class = (global.getWidgetPrefix() === null) ? '' : (global.getWidgetPrefix() + this._css);
	
	this.init = function(opts) {
		opts = merge(opts, {
			name: '',
			value: '',
			type: 'text',
			multiline: false
		});
		
		this._def = {
			children: [
				{tag: opts.multiline ? 'textarea' : 'input', id: '_input', attrs: {
					type: opts.type,
					value: opts.value,
					name: opts.name
				}, style: merge(opts.textStyle, {
					display: 'block',
					// width: '100%',
					// height: '100%',
					MozBoxSizing: 'border-box',
					WebkitBoxSizing: 'border-box',
					MsBoxSizing: 'border-box',
					boxSizing: 'border-box'
				})}
			],
			style: {position: 'relative'}
		};
		
		if (opts.prefixLabel) {
			this._def.children.unshift({id: '_label', text: opts.label});
		}
		
		supr(this, 'init', [opts]);
	}
	
	this.buildWidget = function() {
		var el = this._el;
		var type = this._opts.type;
		if ('ontouchstart' in this._el) {
			this._overlay = $({
				parent: this._el,
				attrs: {
					noCapture: true
				},
				style: {
					position: 'absolute',
					top: '0px',
					left: '0px',
					width: '100%',
					height: '100%',
					zIndex: 1
				}
			});
			
			this._overlay.addEventListener('click', bind(this, function() {
				$.hide(this._overlay);
				this._input.focus();
			}), true);
		}
		
		if (!this._opts.prefixLabel || this._opts.placeholder) {
			var label = this.getI18n('label');
			if (this._input.getAttribute('placeholder') === null) {
				this._input.setAttribute('placeholder', this._opts.placeholder || label);
			} else {
				this._placeholder = $.create({
					tag: 'button',
					text: label,
					className: global.getWidgetPrefix() + 'textInputLabel',
					style: {position: 'absolute'},
					parent: el
				});	
			}
		}
		
		this.initMouseEvents(el);
		this.initFocusEvents(this._input);
		this.initKeyEvents(this._input);
	}

	this.getInputElement = function () { return this._input; }
	
	this.setName = function(name) {
		supr(this, 'setName', arguments);
		
		if (this._input) { this._input.name = name; }
	}
	
	this.setValue = function(value) { this._value = this._input.value = value; }
	this.getValue = function() { return this._input.value; }
	
	this.onKeyDown = function() {
		supr(this, 'onKeyDown', arguments);
		if (this._placeholder) { $.hide(this._placeholder); }
	}
	
	this.onKeyUp = function() {
		supr(this, 'onKeyUp', arguments);
		this.checkLabel();
		this.checkValue();
	}

	this.onMouseDown = function(evt) {
		supr(this, 'onMouseDown', arguments);

		evt.stopPropagation();
//		$.stopEvent(evt);
	}
	
	this.onKeyPress = function(e) {
		supr(this, 'onKeyPress', arguments);
		if (e.keyCode == 13) {
			this.publish('EnterPressed');
		}
		this.checkValue();
	}
	
	this.onBlur = function() {
		supr(this, 'onBlur');
		this.checkLabel();
		
		if (this._overlay) {
			$.show(this._overlay);
		}
	}
	
	this.checkValue = function() {
		if (this._value != this._input.value) {
			this._value = this._input.value;
			this.publish('change', this._value);
			this.publish('ValueChange', this._value);
		}
	}
	
	this.checkLabel = function() {
		if(this._placeholder && /^\s*$/.test(this._input.value)) {
			$.show(this._placeholder);
		}
	}
	
	this.onClick = function() {
		supr(this, 'onClick');
		
		//setTimeout(bind(this._input, 'focus'), 100);
	}
});

Widget.register(TextInput, 'TextInput');
