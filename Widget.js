"use import";

from util.browser import $;
import .Element, .Events, .global;
import .i18n;
import .Delegate;

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
	this._css = 'widget';
	this._name = '';

	this.init = function(opts) {
		this._children = [];

		this._classes = {
			label: '.Label',
			list: '.List',
			text: '.TextInput',
			textarea: '.TextArea',
			password: '.TextInput',
			scroller: '.Scroller',
			canvas: '.Canvas',
			slider: '.Slider',
			color: '.Color',
			vcenter: '.VerticalCenter',
			treelist: '.TreeList',
			graph: '.Graph'
		};

		// ===
		// merge this._def and opts
		var def = this._def;
		if (!def) { def = this._def = {}};

		// className merges
		if (def.className) {
			opts.className = opts.className ? opts.className + " " + def.className : def.className;
		}

		// children from opts gets added to def
		if (opts.children) {
			// must make a local copy first, or else all instances of the class will share the same _def!
			if (!this.hasOwnProperty('_def')) {
				def = this._def = merge({}, this._def);
			}
			
			if (!def.children) {
				def.children = opts.children;
			} else {
				def.children = def.children.concat(opts.children);
			}
		}

		// opts take precedence over def
		this._opts = opts = merge(opts, def);
		delete opts.children;

		// end merge
		// ===

		if (opts.name) { this._name = opts.name; }
		if (opts.delegate) { this.delegate = opts.delegate; }
		if (opts.controller) { this.controller = opts.controller; }
		if (opts.parent) {
			var parent = this._parent = opts.parent;
			var hasWidgetParent = parent instanceof Widget;
			if (hasWidgetParent) {
				var widgetParent = opts.parent;
				opts.parent = parent.getContainer();
			} else if (!parent.appendChild) {
				delete opts.parent;
			}
			
			this.build();
			
			if (hasWidgetParent) {
				widgetParent.addWidget(this);
			}
		}
	};

	this.getParent = function() { return this._parent; };

	this.setParent = function(parent) {
		this._parent = parent;
		var el = parent && (parent.getContainer && parent.getContainer() || parent.appendChild && parent || null);
		if (el) {
			if (!this._el) {
				this._opts.parent = el;
				this.build();
			} else {
				el.appendChild(this._el);
			}
		}
	};

	this.getChildren = function() {
		return this._children;
	};

	this.getFirstChild = function() {
		return (this._children && this._children.length) ? this._children[0] : null;
	};

	this.dispatchButton = function(target, evt) {
		this.delegate.call(this, target, evt);
	};

	this.addWidget = function(def, target) {
		if (!target) { target = this; }
		if (!this._el) { this.build(); }

		// def is either a Widget or a definition for a Widget
		if (!(def instanceof Widget)) {
			// if it is not yet a widget, make it (or make a DOM node)
			var def = merge({}, def, {parent: this.getContainer()});

			if (def.children) {
				var children = def.children;
				delete def.children;
			}
			var el;
			if (!def.type || typeof def.type == 'string') {
				if (this._classes[def.type]) {
					var Constructor = jsio('import ' + this._classes[def.type]);
					el = new Constructor(def);
				} else {
					switch (def.type) {
						case 'checkbox':
							import .CheckBox;
							el = new CheckBox(def);
							el.subscribe('Select', target, 'dispatchButton', def.id);
							break;

						case 'image':
							el = $(merge({tag: 'img'}, def));
							break;

						case 'button':
							if (typeof TextButton == 'undefined') {
								import .TextButton;
							}
							el = new TextButton(def);
							el.subscribe('Select', target, 'dispatchButton', def.id);
							break;

						case 'select':
							break;

						default:
							el = $(def);
							break;
					}
				}
			} else {
				el = new def.type(def);
			}

			if (def.id) { target[def.id] = el; }
		} else {
			el = def;
		}

		if (el instanceof Widget) {
			if (!el.getParent()) { el.setParent(this); }
			this._children.push(el);
//			this.getContainer().appendChild(el.getElement());
		} else {
//			this.getContainer().appendChild(el);
		}

		if (children) {
			var parent = el;
			for (var i = 0, c; c = children[i]; ++i) {
				if (parent.addWidget) {
					parent.addWidget(c, target);
				} else {
					this.addWidget(merge({parent: parent}, c), target);
				}
			}
		}

		return el;
	};

	this.getContainer = function() { return this._el; };
	this.getName = function() { return this._name; };
	this.setName = function(name) { this._name = name; };

	this.buildContent = function() {
		$.addClass(this._el, global.getWidgetPrefix() + this._css);

		if (!this.delegate) { this.delegate = new Delegate(); }

		// TODO: what's this doing here?
		if (this._opts.errorLabel) {
			this._errorLabel = $.create({html: this._opts.errorLabel, className: global.getWidgetPrefix() + 'textInputErrorLabel', parent: this._el});
		}

		if (this._def) { this.buildChildren(this); }
		this.buildWidget(this._el);
	};

	this.buildChildren = function(target) {
		var children = (this._def.children || []).concat(this._opts.children || []);
		for (var i = 0, n = children.length; i < n; ++i) {
			this.addWidget(children[i], target);
		}
	};

	this.buildWidget = function() {};

	// TODO: what's this doing here?
	this.errors = function() {
		return this.validators.map(function(item){
			if (item.isValid == false){
				return item.message;
			}
		});
	};

	// TODO: what's this doing here?
	this.validate = function() {
		var isValid = true;
		for (var i = 0, len = this.validators.length; i < len; ++i) {
			var v = this.validators[i];
			isValid = isValid && (v.isValid = v.call(this));
		}
		return (this._isValid = isValid);
	};

	// TODO: what's this doing here?
	this._isValid = true;
	this.isValid = function() { return this._isValid; }
	this.validators = [];

	this.getI18n = function(key, id) {
		var src = key in this._opts
			? this._opts
			: i18n.get(id || this._opts.id);
		
		return src && src[key] || '';
	};

	this.getElement = function() {
		if (!this._el) { this.build(); }
		return this._el;
	};

	this.onBeforeShow = function() {
		for (var i = 0, child; child = this._children[i]; ++i) {
			child.onBeforeShow.apply(child, arguments);
		}
	};

	this.onShow = function() {
		for (var i = 0, child; child = this._children[i]; ++i) {
			child.onShow.apply(child, arguments);
		}
	};

	this.onBeforeHide = function() {
		for (var i = 0, child; child = this._children[i]; ++i) {
			child.onBeforeHide.apply(child, arguments);
		}
	};

	this.onHide = function() {
		for (var i = 0, child; child = this._children[i]; ++i) {
			child.onHide.apply(child, arguments);
		}
	};

	this.show = function() {
		this.onBeforeShow();
		$.show(this.getElement());
		this.onShow();
	};

	this.hide = function() {
		this.onBeforeHide();
		$.hide(this.getElement());
		this.onHide();
	};

	this.remove = function() {
		this.onBeforeHide();
		$.remove(this.getElement());
		this.onHide();
	};

	this.putHere = function() {
		if(!this._el) { this.build(); }
		
		var id = 'jsioWidgetId' + (++uid);
		global.getTargetDocument().write('<div id="'+id+'"></div>');
		setTimeout(bind(this, _replaceNode, id), 0);
		
		return this;
	};

	function _replaceNode(id) {
		var el = $.id(id);
		el.parentNode.insertBefore(this._el, el);
		el.parentNode.removeChild(el);
	};

	this.appendTo = function(parent) {
		if(parent) {
			var parent = $.id(parent);
			if(!this._el) { this.build(); }
			parent.appendChild(this._el);
		}
		return this;
	};

	this.onclick = function(f) { $.onEvent(this._el, 'click', f); return this; };
});

var map = {};
var lowerCaseMap = {}
Widget.register = function(cls, name) {
	if (name in map) { throw Error("A widget with name '" + name + "' is already registered"); }
	map[name] = cls;
	lowerCaseMap[name.toLowerCase()] = cls;
};

Widget.get = function(name) {
	return lowerCaseMap[name.toLowerCase()];
}
