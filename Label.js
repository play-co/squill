let exports = {};

import browser from 'util/browser';
let $ = browser.$;
import Widget from 'squill/Widget';
import bindings from 'squill/models/bindings';

exports = Class(Widget, function () {
  this._css = 'label';
  this._def = {
    children: [{
        id: '_labelSpan',
        tag: 'span'
      }]
  };

  this.buildWidget = function () {
    this.setLabel(this.getI18n('label'));

    var opts = this._opts;
    if (opts.format) {
      bindings.parseFormat(this, opts.format);
    }
  };

  this.setText = function (text) {
    $.setText(this._labelSpan, text);
  };
  this.setHTML = function (html) {
    this._labelSpan.innerHTML = html;
  };
});

exports.prototype.setData = exports.prototype.setText;
exports.prototype.setValue = exports.prototype.setText;
exports.prototype.setLabel = exports.prototype.setText;

export default exports;
