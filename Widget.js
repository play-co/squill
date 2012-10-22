"use import";

from util.browser import $;
import .Element, .Events, .global;
import .i18n;
import .Delegate;
from .__imports__ import classes as WIDGET_CLASSES;

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

var WidgetSet = Class(function () {
	this.init = function (target) {
		this._target = target;
		this.events = [];
	}

	this.hasWidget = function (id) { return !!this._target[id]; };

	this.addWidget = function (id, widget) {
		this._target[id] = widget;
	};

	this.addSubscription  = function(widget, signal /* ... args */) {
		this.events.push({
			widget: widget,
			signal: signal,
			args: Array.prototype.slice.call(arguments, 2)
		});
	}

	this.apply = function(target) {
		merge(target, this.widgets);

		if (target.dispatchEvent) {
			for (var i = 0, evt; evt = this.events[i]; ++i) {
				evt.widget.subscribe.apply(evt.widget, [evt.signal, target, 'dispatchEvent'].concat(evt.args));
			}

			this.events = [];
		}
	}
});

var Widget = exports = Class([Element, Events], function() {
	this._css = 'widget';
	this._name = '';

	this.__getDef__ = function () {
		var protoDef = this.constructor.prototype._def;
		var cls = this.constructor;
		var def;
		while ((cls = cls.prototype.__parentClass__)) {
			if (cls.prototype.hasOwnProperty('_def')) {
				if (!def) { def = protoDef || {}; }

				copyDef(def, cls.prototype._def);
			}
		}

		// no parent classes were merged in?
		if (!def) { def = protoDef || {}; }

		// handle base _def
		if (this.hasOwnProperty('_def')) {
			copyDef(def, this._def);
		}

		function copyDef (target, src) {
			for (var key in src) {
				if (key == 'className' && target.className) {
					target.className = src.className + ' ' + target.className;
				} else if (key == 'children' && target.children) {
					target.children = src.children.concat(target.children);
				} else if (!target.hasOwnProperty(key)) {
					target[key] = src[key];
				}
			}
		}

		return def;
	}

	this.init = function(opts) {
		opts = opts || {};

		this._children = [];

		// ===
		// merge this._def and opts

		var def = this._def = this.__getDef__();

		// className merges
		if (def.className) {
			opts.className = opts.className ? opts.className + " " + def.className : def.className;
		}
		
		// opts take precedence over def
		this._opts = opts;
		for (var name in def) {
			if (name != 'children' && !opts.hasOwnProperty(name) && def.hasOwnProperty(name)) {
				opts[name] = def[name];
			}
		}

		// delete opts.children;

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

	this.build = function() {
		if (!this._el) {
			var opts = this._opts;
			var children = opts.children;
			
			if (children) { delete opts.children; }
			this._el = $.create(this._opts);
			if (children) { opts.children = children; }

			this.buildContent();
		}
		
		return this;
	}

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

	this.dispatchEvent = function(target, evt) {
		this.delegate.call(this, target, evt);
	};

	this.addWidget = function(def, result) {
		if (!this._el) { this.build(); }

		// def is either a Widget or a definition for a Widget
		if (!(def instanceof Widget)) {
			// if it is not yet a widget, make it (or make a DOM node)
			var opts = merge({}, def, {parent: this.getContainer(), __result: result});

			if (opts.children) {
				var children = opts.children;
				delete opts.children;
			}

			var el;
			if ('type' in opts && !opts.type) {
				logger.warn('Did you forget to provide a type?', opts);
			}
			
			if (!opts.type || typeof opts.type == 'string') {
				if (WIDGET_CLASSES[opts.type]) {
					var Constructor = jsio('import ' + WIDGET_CLASSES[opts.type]);
					el = new Constructor(opts);
				} else {
					switch (opts.type) {
						case 'checkbox':
							import .CheckBox;
							el = new CheckBox(opts);
							break;

						case 'image':
							el = $(merge({tag: 'img'}, opts));
							break;

						case 'button':
							if (typeof TextButton == 'undefined') {
								import .TextButton;
							}
							el = new TextButton(opts);
							if (result) {
								result.addSubscription(el, 'Select', opts.id);
							}
							break;

						case 'select':
							break;

						default:
							el = $(opts);
							break;
					}
				}
			} else {
				el = new opts.type(opts);
			}
			
			if (result && opts.id && !result.hasWidget(opts.id)) {
				result.addWidget(opts.id, el);
			}
		} else {
			el = def;
		}
		
		if (el instanceof Widget) {
			if (!el.getParent()) { el.setParent(this); }
			this._children.push(el);
		}

		if (children) {
			if (el.buildChildren) {
				el.buildChildren(children, result);
			} else {
				for (var i = 0, c; c = children[i]; ++i) {
					this.addWidget(merge({parent: el}, c), result);
				}
			}
		}

		return el;
	};

	this.getContainer = function() { return this._el; };
	this.getName = function() { return this._name; };
	this.setName = function(name) { this._name = name; };

	this.buildContent = function() {
		var opts = this._opts;

		if (global.getWidgetPrefix() !== null) {
			$.addClass(this._el, global.getWidgetPrefix() + this._css);
		}

		if (!this.delegate) { this.delegate = new Delegate(); }

		// TODO: what's this doing here?
		if (opts.errorLabel) {
			this._errorLabel = $.create({html: opts.errorLabel, className: global.getWidgetPrefix() + 'textInputErrorLabel', parent: this._el});
		}

		var def = this._def;

		// def items always go on the widget
		if (def && def.children) {
			var localRes = new WidgetSet(this);
			this.buildChildren(def.children, localRes);
		}

		var result = opts.__result || new WidgetSet(this);

		// opts items sometimes go on the widget
		if (opts.children) {
			this.buildChildren(opts.children, result);
		}

		this.buildWidget(this._el, result);
	};

	this.buildChildren = function(children, result) {
		for (var i = 0, n = children.length; i < n; ++i) {
			this.addWidget(children[i], result);
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
		this._isShowing = true;
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
		this._isShowing = false;
		for (var i = 0, child; child = this._children[i]; ++i) {
			child.onHide.apply(child, arguments);
		}
	};

	this.isShowing = function() { return this._isShowing; }

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

Widget.WidgetSet = WidgetSet;
