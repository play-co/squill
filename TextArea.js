import browser from 'util/browser';
let $ = browser.$;
import Widget from './Widget';
import TextInput from './TextInput';

var TextArea = exports = Class(TextInput, function (supr) {
  this._tag = 'textarea';
});

Widget.register(TextArea, 'TextArea');
