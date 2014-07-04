import lib.PubSub;
import .Widget;
import .Delegate;

from util.browser import $;

var Menu = exports = Class(Widget, function(supr) {
  // this.init = function(params) {
  //  var params = JS.merge(params, {parent: $.id('wrapper')});
  //  supr(this, 'init', [params]);
  // }

  this._css = 'menu';

  this._def = {
    children: [{id: 'container'}]
  };

  // the default menu delegate just forwards to the menu controller
  this.delegate = new Delegate(function(on) {
    on.call = function(ctx, name) {
      var delegate = ctx.controller.delegate;
      delegate.call.apply(delegate, [ctx.controller].concat(Array.prototype.slice.call(arguments, 1)));
    }
  });

  this.getContainer = function () { return this.container; }

  this.onBeforeShow = function() {}
  this.onShow = function() {}
  this.onBeforeHide = function() {}
  this.onHide = function() {}

  this.toggle = function () {
    if (this._isShowing) {
      this.hide();
    } else {
      this.show();
    }
  }

  this.show = function() {
    this._isShowing = true;

    var menuEl = this._el;
    var mouseHandler = bind(this, function (e) {
      var el = e.target;
      while (el) {
        if (el == menuEl) {
          return;
        }

        el = el.parentNode;
      }

      // close menu
      this.hide();
      e.preventDefault();
      e.stopPropagation();

      document.body.removeEventListener('mousedown', mouseHandler, true);
    });

    document.body.addEventListener('mousedown', mouseHandler, true);

    $.show(menuEl);

    this.emit('open');
    Menu.emit('open', this);
  }

  this.hide = function() {
    this._isShowing = false;

    $.hide(this._el);

    this.emit('close');
    Menu.emit('close', this);
  }
});

var subs = new lib.PubSub();
Menu.emit = bind(subs, 'emit');
Menu.on = bind(subs, 'on');
Menu.removeListener = bind(subs, 'removeListener');
