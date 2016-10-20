import Widget from 'squill/Widget';
import bindings from 'squill/models/bindings';

exports = Class(Widget, function () {
  this._css = 'image';
  this._def = { tag: 'img' };

  this.buildWidget = function () {
    var opts = this._opts;
    if (opts.format) {
      bindings.parseFormat(this, opts.format);
    }
  };

  Object.defineProperty(this, 'src', {
    set: function (src) {
      this._el.src = src;
    },
    get: function () {
      return this._el.src;
    }
  });

  this.setData = this.setSrc = function (src) {
    this.src = src;
  };
});
