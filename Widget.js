jsio('from util.browser import $');
jsio('import .Element, .Events, .global');

var uid = 0;

function shallowCopy(p) {
	var o = {};
	for(var i in p) {
		if(p.hasOwnProperty(i)) {
			o[i] = p[i];
		}
	}
	return o;
}


var Widget = exports = Class([Element, Events], function() {
	this._tag = 'div';
	this._css = 'widget';
	this._name = '';
	
	this.init = function(params) {
		this._params = shallowCopy(params);
		if (params.name) { this._name = params.name; }
	}
	
	this.getName = function() { return this._name; }
	this.setName = function(name) { this._name = name; }
	
	this.buildContent = function() {
		$.addClass(this._el, global.getWidgetPrefix() + this._css);
		this.buildWidget();
	}
	
	this.buildWidget = function() {}
	
	this.getElement = function() {
		if (!this._el) { this.build(); }
		return this._el;
	}
	
	this.hide = function() {
		$.hide(this.getElement());
	}
	
	this.show = function() {
		$.show(this.getElement());
	}
	
	this.remove = function() {
		$.remove(this.getElement());
	}
	
	this.putHere = function() {
		if(!this._el) { this.build(); }
		
		var id = 'jsioWidgetId' + (++uid);
		global.getTargetDocument().write('<div id="'+id+'"></div>');
		setTimeout(bind(this, _replaceNode, id), 0);
		
		return this;
	}
	
	function _replaceNode(id) {
		var el = $.id(id);
		el.parentNode.insertBefore(this._el, el);
		el.parentNode.removeChild(el);
	}
	
	this.appendTo = function(parent) {
		if(parent) {
			var parent = $.id(parent);
			if(!this._el) { this.build(); }
			parent.appendChild(this._el);
		}
		return this;
	}
	
	this.onclick = function(f) { $.onEvent(this._el, 'click', f); return this; }
});

var map = {};
var lowerCaseMap = {}
Widget.register = function(cls, name) {
	if (name in map) { throw Error("A widget with name '" + name + "' is already registered"); }
	map[name] = cls;
	lowerCaseMap[name.toLowerCase()] = cls;
}

Widget.get = function(name) {
	return lowerCaseMap[name.toLowerCase()];
}
