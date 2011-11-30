var Delegate = exports = Class(function() {
	this.init = function(def) {
		def && def(this);
	}
	
	this.extend = function(def) {
		var delegate = new Delegate(def);
		delegate.parent = this;
		return delegate;
	}
	
	this.call = function(ctx, name) {
		if (this[name]) {
			return this[name].apply(ctx, Array.prototype.slice.call(arguments, 1));
		} else if (this.parent) {
			this.parent.call(ctx, name);
		}
	}
});
