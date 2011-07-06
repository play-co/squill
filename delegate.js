exports.call = function(ctx, name) {
	if (this[name]) {
		return this[name].apply(ctx, Array.prototype.slice.call(arguments, 1));
	} else if (this.parent) {
		this.parent.call(name);
	}
};

exports.create = function(def) {
	var delegate = {};
	def(delegate);
	if (!delegate.call) { delegate.call = exports.call; }
	return delegate;
}
