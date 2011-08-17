exports.create = function(def) {
	var delegate = new exports.Delegate();
	if (def) { def(delegate); }
	return delegate;
}

exports.Delegate = Class(function() {
	this.extend = function(def) {
		var delegate = exports.create(def);
		delegate.parent = this;
		return delegate;
	}
	
	this.call = function(ctx, name) {
		if (this[name]) {
			return this[name].apply(ctx, Array.prototype.slice.call(arguments, 1));
		} else if (this.parent) {
			this.parent.call(name);
		}
	}
});