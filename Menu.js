import { bind } from 'base';

import PubSub from 'lib/PubSub';
import Widget from './Widget';
import Delegate from './Delegate';

import browser from 'util/browser';
let $ = browser.$;

var Menu = exports = Class(Widget, function (supr) {
  // this.init = function(params) {
  //  var params = JS.merge(params, {parent: $.id('wrapper')});
  //  supr(this, 'init', [params]);
  // }
  this._css = 'menu';

  this._def = { children: [{ id: 'container' }] };

  // the default menu delegate just forwards to the menu controller
  this.delegate = new Delegate(function (on) {
    on.call = function (ctx, name) {
      var delegate = ctx.controller.delegate;
      delegate.call.apply(delegate, [ctx.controller].concat(Array.prototype.slice.call(arguments, 1)));
    };
  });

  this.getContainer = function () {
    return this.container;
  };

  this.onBeforeShow = function () {
  };
  this.onShow = function () {
  };
  this.onBeforeHide = function () {
  };
  this.onHide = function () {
  };

  this.toggle = function () {
    if (this._isShowing) {
      this.hide();
    } else {
      this.show();
    }
  };

  this.show = function () {
    this._isShowing = true;

    var menuEl = this._el;
    var eventHandler = bind(this, function (e) {
      var el = e.target;
      while (el) {
        if (el == menuEl) {
          return true;
        }


        if (/squill-checkbox/.test(el.className)) {
          return false;
        }


        el = el.parentNode;
      }


      // close menu
      e.preventDefault && e.preventDefault();
      e.stopImmediatePropagation && e.stopImmediatePropagation();
      e.stopPropagation && e.stopPropagation();
      e.cancelBubble = true;
      return true;
    });

    var clickHandler = bind(this, function (e) {
      if (eventHandler(e)) {
        this.hide();

        untrapIframes();
        document.body.removeEventListener('mousedown', eventHandler, true);
        document.body.removeEventListener('mouseup', eventHandler, true);
        document.body.removeEventListener('click', clickHandler, true);
      }
    });

    trapIframes();
    document.body.addEventListener('mousedown', eventHandler, true);
    document.body.addEventListener('mouseup', eventHandler, true);
    document.body.addEventListener('click', clickHandler, true);

    $.show(menuEl);

    this.emit('open');
    Menu.emit('open', this);
  };

  this.hide = function () {
    this._isShowing = false;

    $.hide(this._el);

    this.emit('close');
    Menu.emit('close', this);
  };
});

var subs = new PubSub();
Menu.emit = bind(subs, 'emit');
Menu.on = bind(subs, 'on');
Menu.removeListener = bind(subs, 'removeListener');

var _trappedFrames = [];
function trapIframes() {
  if (_trappedFrames.length) {
    untrapIframes();
  }


  _trappedFrames = Array.prototype.map.call(document.getElementsByTagName('iframe'), function (el) {
    var retVal = {
      el: el,
      set: el.style.pointerEvents
    };

    el.style.pointerEvents = 'none';

    return retVal;
  });
}


function untrapIframes() {
  _trappedFrames.forEach(function (item) {
    item.el.style.pointerEvents = item.set;
  });
}
