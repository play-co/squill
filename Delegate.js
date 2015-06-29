var SLICE = Array.prototype.slice;

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
      return this[name].apply(ctx, SLICE.call(arguments, 2));
    } else if (this.parent) {
      return this.parent.apply(ctx, SLICE.call(arguments, 1));
    }
  }

  this.apply = function (ctx, args) {
    this.call.apply(this, [ctx].concat(SLICE.call(args)));
  }
});
