jsio('import lib.PubSub as PubSub');
jsio('from util.browser import $');
jsio('import .Events');

function shallowCopy(p) {
	var o = {};
	for(var i in p) {
		if(p.hasOwnProperty(i)) {
			o[i] = p[i];
		}
	}
	return o;
}

var _wp = 'jsiox-';
var win = window;
var doc = document;
var uid = 0;

exports.setTargetWindow = function(w) { win = w; doc = w.document; }
exports.getTargetWindow = function() { return win; }
exports.setWidgetPrefix = function(p) { _wp = p; }
exports.getWidgetPrefix = function() { return _wp; }

exports.Widget = Class(PubSub, function() {
	this._tag = 'div';
	this._name = 'widget';
	this.init = function(params) {
		this._params = shallowCopy(params);
	}
	
	this.create = function() {
		var el = this._el = this._params.el || doc.createElement(this._tag);
		
		var p = this._params;
		if(p.className) { el.className = p.className; }
		if(p.name) { el.name = p.name; }
		if(p.id) { el.id = p.id; }
		$.addClass(el, _wp + this._name);
		
		this.buildWidget();
		
		return this;
	}
	
	this.buildWidget = function() {}
	
	this.getElement = function() { return this._el; }
	
	this.putHere = function() {
		if(!this._el) { this.create(); }
		
		var id = 'jsioWidgetId' + (++uid);
		doc.write('<div id="'+id+'"></div>');
		setTimeout(bind(this, function() { doc.getElementById(id).appendChild(this._el) }), 0);
		
		return this;
	}
	
	this.appendTo = function(parent) {
		if(parent) {
			if(!this._el) { this.create(); }
			parent.appendChild(this._el);
		}
		return this;
	}
	
	this.onclick = function(f) { $.onEvent(this._el, 'click', f); return this; }
});

exports.TextInput = Class([exports.Widget, Events], function(supr) {
	this._type = 'text';
	this._name = 'textInput';
	this._class = _wp + this._name;
	
	this.buildWidget = function() {
		var el = this._el,
			label = this._params.label || '',
			value = this._params.value || '';
		
		this._label = $.create({text: label, className: _wp + 'textInputLabel', parent: el});
		this._input = $.create({tag: 'input', attrs: {type: this._type, value: value}, parent: el});
		
		this.initMouseEvents(el);
		this.initFocusEvents(this._input);
		this.initKeyEvents(this._input);
	}
	
	this.getValue = function() { return this._input.value; }
	
	this.onMouseDown = function(e) {
		supr(this, 'onMouseDown', arguments);
		$.stopEvent(e);
		
		this._input.focus();
	}
	
	this.onKeyDown = function() {
		$.hide(this._label);
	}
	
	this.onBlur = function() {
		supr(this, 'onBlur');
		if(/^\s*$/.test(this._input.value)) {
			$.show(this._label);
		}
	}
});

exports.PasswordInput = Class(exports.TextInput, function(supr) {
	this._type = 'password';
});

exports.Button = Class([exports.Widget, Events], function(supr) {
	this._name = 'btn';
	this._class = _wp + this._name;
	
	this.buildWidget = function() {
		var el = this._el;
		
		if(this._params.onclick) { this.subscribe('Click', this, this._params.onclick); }
		this.initMouseEvents(el);
		
		el.style.userSelect = 'none';
        el.style.MozUserSelect = 'none'; // Mozilla
        el.style.KhtmlUserSelect = 'none'; // Safari
        el.unselectable = 'on'; // IE
	}
});

exports.TextButton = Class(exports.Button, function(supr) {
	
	this.buildWidget = function() {
		var el = this._el,
			label = this._params.label || '';
		
		this._left = $.create({className: this._class + 'Left', parent: el});
		this._center = $.create({className: this._class + 'Center', parent: el, text: label});
		this._right = $.create({className: this._class + 'Right', parent: el});
		
		if(this._params.onclick) {
			this.subscribe('Click', this, this._params.onclick);
		}
		
		this.initMouseEvents(el);
	}
	
	this.setLabel = function(label) {
		this._params.label = label;
		if(this._center) { $.setText(this._center, label); }
	}
});

exports.SubmitButton = Class(exports.TextButton, function(supr) {
	this.putHere = function() {
		supr(this, 'putHere', arguments);
		if(this._params.form) {
			this.onclick(bind(this, function() {
				this._params.form.submit();
			}));
		} else {
			setTimeout(bind(this, function() {
				var el = this._el;
				while(el.tagName != 'FORM' && (el = el.parentNode)) {}
				if(el && el.submit) {
					this.onclick(bind(this, function() {
						el.submit();
					}));
				}
			}), 0);
		}
		return this;
	}
});

