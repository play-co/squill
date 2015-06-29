import .Widget;
import .models.DataItem as DataItem;

from util.browser import $;

var Cell = exports = Class(Widget, function(supr) {

  this._css = 'cell';

  this.init = function (opts) {
    supr(this, 'init', arguments);

    if (opts.item) {
      if (opts.item instanceof DataItem) {
        this.setItem(opts.item.data, opts.item);
      } else {
        this.setItem(opts.item);
      }
    }
  }

  this.buildWidget = function(el) {
    this.initMouseEvents();
  }

  this.isSelected = function() {
    return this._widgetParent.selection && this._widgetParent.selection.isSelected(this._item);
  };

  this.select = function() {
    this._widgetParent.selection && this._widgetParent.selection.select(this._item);
  };

  this.deselect = function() {
    this._widgetParent.selection && this._widgetParent.selection.deselect(this._item);
  };

  this.setItem = function(data, item) {
    this.setModel(data);
    this._data = data;
    this._item = item || data;
    this.updateSelected();
  };

  this.getData = function () { return this._data; };
  this.getItem = function () { return this._item; };

  this.render = function() {}

  this.onClick = this.onSelect = function() {
    if (!this._widgetParent.selection) { return; }

    var type = this._widgetParent.selection.getType();
    if (type == 'toggle' || type == 'multi') {
      if (this.isSelected()) {
        this.deselect();
      } else {
        this.select();
      }
    } else if (type == 'single') {
      this.select();
    }
  }

  this.updateSelected = function() {
    var isSelected = this.isSelected();
    if (isSelected) {
      $.addClass(this._el, 'selected');
    } else {
      $.removeClass(this._el, 'selected');
    }
    return isSelected;
  }
});

exports.Selectable = exports;
