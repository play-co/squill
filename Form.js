jsio('import std.js as JS');
jsio('import .Element');
jsio('import .Widget');

exports = Class(Widget, function(supr) {
	
	this.isValid = true;

	this.init = function(opts) {
		opts = JS.merge(opts, {});
		supr(this, 'init', [opts]);
		
		this._items = [];
		if (opts.items) {
			this.addItems(opts.items);
		}
	}
	
	this.buildContent = function() {
		this.each(bind(this, function(item) {
			if ($.isElement(item)) {
				this._el.appendChild(item);
			} else {
				item.appendTo(this._el);
			}
		}));
	}

	this.validate = function(){
		this.each(bind(this, function(item){
			if (item.isValid){
				if (!item.isValid()){
					this.isValid = false;
				}
			}
		}));
		return this.isValid;
	}
	
	this.each = function(cb) {
 		for(var i = 0, w; w = this._items[i]; ++i ){
			cb(w);
		}
	}
		

	this.addItems = function(items) {
		for(var i = 0, len = items.length; i < len; ++i) {
			var def = items[i];
			this.add(def);
		}
	}
	
	this.add = function(item) {
		if ($.isElement(item)) {
			if (this._el) {
				this._el.appendChild(item);
			}
		} else if (item instanceof Widget) {
			item.appendTo(this._el);
		} else if (item.type) {
			var ctor;
			if (ctor = Widget.get(item.type)) {
				item = new ctor(item).appendTo(this._el);
			} else {
				logger.warn('unknown widget ctor: ' + item.type);
				return;
			}
		} else {
			logger.warn('unknown item could not be added to form');
			return;
		}
		
		this._items.push(item);
	}
	
	this.removeByName = function(name) {
		
	}
});