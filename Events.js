jsio('from util.browser import $');

exports = Class(function() {
	this.event = function(name, handler, args) {
		if (!this._eventEnabled) { this._eventEnabled = {}; }
		if (!args) { args = []; }
		args = [this, handler].concat(args);
		
		var handler = bind.apply(this, args),
			events = this._eventEnabled;
		
		events[name] = true;
		$.onEvent(this._el, name, function() { if(events[name]) { handler.apply(this, arguments); }});
	}
	
	this.initMouseEvents = function() {
		this.event('mouseover', 'onMouseOver');
		this.event('mouseout', 'onMouseOut');
		this.event('mousedown', 'onMouseDown');
		this.event('mouseup', 'onMouseUp');
		this.event('click', 'onClick');
	}
	
	this.initFocusEvents = function() {
		this.event('focus', 'onFocus');
		this.event('blur', 'onBlur');
	}
	
	this.initKeyEvents = function(el) {
		this.event('keydown', 'onKeyDown');
		this.event('keypress', 'onKeyPress');
		this.event('keyup', 'onKeyUp');
	}
	
	this.onMouseOver = function() {
		if (!this._enableMouseEvents) 
		this._isOver = true;
		$.addClass(this._el, this._class + '-hover');
		this.publish('Over');
	}
	
	this.onMouseOut = function() {
		this._isOver = false;
		this.onMouseUp();
		$.removeClass(this._el, this._class + '-hover');
		this.publish('Out');
	}

	this.onMouseDown = function() {
		this._isDown = true;
		$.addClass(this._el, this._class + '-down');
		this.publish('Down');
	}
	
	this.onMouseUp = function() {
		this._isDown = false;
		$.removeClass(this._el, this._class + '-down');
		this.publish('Up');
	}
	
	this.onClick = function() {
		this.publish('Click');
	}
	
	this.onFocus = function() {
		this._isFocused = true;
		$.addClass(this._el, this._class + '-focused');
		this.publish('Focus');
	}
	
	this.onBlur = function() {
		this._isFocused = false;
		$.removeClass(this._el, this._class + '-focused');
		this.publish('Blur');
	}
	
	this.onKeyUp = function() {
		
	}
	
	this.onKeyPress = function() {
		
	}
	
	this.onKeyDown = function() {
		
	}
});