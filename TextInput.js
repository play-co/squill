import browser from 'util/browser';
let $ = browser.$;
import Widget from './Widget';
import bindings from 'squill/models/bindings';

var TextInput = exports = Class(Widget, function (supr) {
  this._type = 'text';
  this._css = 'textInput';

  this.init = function (opts) {
    opts = merge(opts, {
      name: '',
      value: '',
      multiline: false
    });

    this._def = {
      children: [{
          tag: opts.multiline ? 'textarea' : 'input',
          id: '_input',
          attrs: {
            type: 'text',
            value: opts.value,
            name: opts.name
          },
          style: merge(opts.textStyle, {
            MozBoxSizing: 'border-box',
            WebkitBoxSizing: 'border-box',
            MsBoxSizing: 'border-box',
            boxSizing: 'border-box'
          })
        }],
      style: { position: 'relative' }
    };

    if (opts.prefixLabel) {
      this._def.children.unshift({
        id: '_label',
        text: opts.label
      });
    }




    supr(this, 'init', [opts]);
  };

  this.buildWidget = function () {
    var el = this._el;
    var type = this._opts.type;
    if ('ontouchstart' in this._el) {
      this._overlay = $({
        parent: this._el,
        attrs: { noCapture: true },
        style: {
          position: 'absolute',
          top: '0px',
          left: '0px',
          width: '100%',
          height: '100%',
          zIndex: 1
        }
      });

      this._overlay.addEventListener('click', bind(this, function () {
        $.hide(this._overlay);
        this._input.focus();
      }), true);
    }


    var opts = this._opts;
    if (!opts.prefixLabel || opts.placeholder) {
      var label = this.getI18n('label');
      if (this._input.getAttribute('placeholder') === null) {
        this._input.setAttribute('placeholder', opts.placeholder || label);
      } else {
        this._placeholder = $.create({
          tag: 'button',
          text: label,
          style: { position: 'absolute' },
          parent: el
        });
      }
    }


    this.initMouseEvents(el);
    this.initFocusEvents(this._input);
    this.initKeyEvents(this._input);
  };

  this.focus = function () {
    this._input.focus();
  };
  this.blur = function () {
    this._input.blur();
  };

  this.getInputElement = function () {
    return this._input;
  };

  this.setName = function (name) {
    supr(this, 'setName', arguments);

    if (this._input) {
      this._input.name = name;
    }
  };

  this.setData = this.setValue = function (value) {
    if (value === undefined) {
      value = '';
    }


    this.saveSelection();
    this._value = this._input.value = value;
    this.restoreSelection();
  };

  this.getValue = function () {
    return this._input.value;
  };

  this.onKeyDown = function () {
    supr(this, 'onKeyDown', arguments);
    if (this._placeholder) {
      $.hide(this._placeholder);
    }
  };

  this.onKeyUp = function () {
    supr(this, 'onKeyUp', arguments);
    this.checkLabel();
    this.checkValue();
  };

  this.onMouseDown = function (evt) {
    supr(this, 'onMouseDown', arguments);

    evt.stopPropagation();
  };

  //    $.stopEvent(evt);
  this.onKeyPress = function (e) {
    supr(this, 'onKeyPress', arguments);
    if (e.keyCode == 13) {
      this.publish('EnterPressed');
    }
    this.checkValue();
  };

  this.onBlur = function () {
    supr(this, 'onBlur');
    this.checkLabel();

    if (this._overlay) {
      $.show(this._overlay);
    }
  };

  this.isValid = function () {
    return this._isValid;
  };

  this.checkValue = function () {
    var value = this._input.value;
    var formatter = this._opts.formatter;
    if (formatter) {
      value = formatter(value);
    }


    if (value == INVALID_VALUE) {
      this._isValid = false;
      $.addClass(this._el, 'invalid');
      return;
    }


    this._isValid = true;
    $.removeClass(this._el, 'invalid');
    if (this._value != value) {
      this._value = value;
      var input = this._input;
      if (value != input.value) {
        this.saveSelection();
        input.value = value;
        this.restoreSelection();
      }
      this.publish('change', this._value);
      this.publish('ValueChange', this._value);
    }
  };

  this.saveSelection = function () {
    this._selection = {
      start: this._input.selectionStart,
      end: this._input.selectionEnd
    };
  };

  this.restoreSelection = function () {
    var input = this._input;
    if (this._isFocused) {
      input.selectionStart = this._selection.start;
      input.selectionEnd = this._selection.end;
    }
  };

  this.checkLabel = function () {
    if (this._placeholder && /^\s*$/.test(this._input.value)) {
      $.show(this._placeholder);
    }
  };

  this.onClick = function () {
    supr(this, 'onClick');

  };

  //setTimeout(bind(this._input, 'focus'), 100);
  this.setEnabled = function (isEnabled) {
    this._isEnabled = isEnabled;
    if (isEnabled) {
      delete this._input.disabled;
      this.removeClass('disabled');
    } else {
      this._input.disabled = true;
      this.addClass('disabled');
    }
  };

  this.isFocused = function () {
    return this._isFocused;
  };
  this.isEnabled = function () {
    return this._isEnabled;
  };

  this.disable = function () {
    this.setEnabled(false);
  };
  this.enable = function () {
    this.setEnabled(true);
  };
});

var INVALID_VALUE = exports.INVALID_VALUE = {};

Widget.register(TextInput, 'TextInput');
