"use import";

from util.browser import $;
import .Element, .Events, .global;
import .i18n;

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
		this._params = params = merge(params, {});
		if (params.name) { this._name = params.name; }
		if (params.parent) {
			if (params.parent._el) {
				this._parent = params.parent;
				params.parent = params.parent._el;
			} else if (!params.parent.appendChild) {
				delete params.parent;
			} else {
				this._parent = params.parent;
			}
			
			this.build();
		}
	}
	
	this.onInputSelect = function(evt) {}
	
	this.buildChildren = function(def, target) {
		if (!target) { target = this; }
		
		if (def.children) {
			var children = def.children;
			delete def.children;
		}
		
		var el, newParent;
		if (!def.type || typeof def.type == 'string') {
			switch(def.type) {
				case 'vcenter':
					el = $(merge({
						tag: 'table',
						style: merge({height: '100%', width: '100%'}, def.style),
						attrs: {cellpadding: 0, cellspacing: 0},
						children: [
							$({tag: 'tbody', children: [
								$({tag: 'tr', children: [
									newParent = $({tag: 'td', attrs: {valign: 'middle'}, style: {verticalAlign: 'middle'}})
								]})
							]})
						]
					}, def))
					break;
				case 'image':
					el = $(merge({tag: 'img'}, def));
					break;
				case 'button':
					if (typeof TextButton == 'undefined') {
						import .TextButton;
					}
			
					el = new TextButton(def);
					el.subscribe('Select', target, 'onInputSelect', def.id);
					break;
				case 'label':
					if (typeof Label == 'undefined') {
						import .Label;
					}
			
					el = new Label(def);
					break;
				case 'list':
					if (typeof List == 'undefined') {
						import .List;
					}
			
					el = new List(def);
					break;
				case 'text':
				case 'password':
					if (typeof TextInput == 'undefined') {
						import .TextInput;
					}
					
					el = new TextInput(def);
					break;
				case 'scroller':
					if (typeof Scroller == 'undefined') {
						import .Scroller;
					}
					
					el = new Scroller(def);
					newParent = el.getScrollPane();
					break;
				default:
					el = $(def);
					break;
			}
		} else {
			el = new def.type(def);
		}
		
		target[def.id] = el;
		
		if (children) {
			var parent = newParent && newParent._el || newParent || el && el._el || el;
			for (var i = 0, c; c = children[i]; ++i) {
				this.buildChildren(merge({parent: parent}, c), target);
			}
		}

		return el;
	}
	
	this.setDelegate = function(delegate) { this._delegate = delegate; }
	this.setController = function(controller) { this._controller = controller; }
	
	this.getName = function() { return this._name; }
	this.setName = function(name) { this._name = name; }
	
	this.buildContent = function() {
		$.addClass(this._el, global.getWidgetPrefix() + this._css);
		
		// TODO: what's this doing here?
		if (this._params.errorLabel) {
			this._errorLabel = $.create({html: this._params.errorLabel, className: global.getWidgetPrefix() + 'textInputErrorLabel', parent: this._el});
		}
		
		if (this._def) { this.buildChildren(merge({el: this._el}, this._def)); }
		this.buildWidget(this._el);
	}
	
	this.buildWidget = function() {}
	
	// TODO: what's this doing here?
	this.errors = function() {
		return this.validators.map(function(item){
			if (item.isValid == false){
				return item.message;
			}
		});
	}
	
	// TODO: what's this doing here?
	this.validate = function() {
		var isValid = true;
		for (var i = 0, len = this.validators.length; i < len; ++i) {
			var v = this.validators[i];
			isValid = isValid && (v.isValid = v.call(this));
		}
		return (this._isValid = isValid);
	}
	
	// TODO: what's this doing here?
	this._isValid = true;
	this.isValid = function() { return this._isValid; }
	this.validators = [];
	
	this.getI18n = function(key, id) {
		var src = key in this._params
			? this._params
			: i18n.get(id || this._params.id);
		
		return src && src[key] || '';
	}
	
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
