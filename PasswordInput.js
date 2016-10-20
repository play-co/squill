import TextInput from './TextInput';
import Widget from './Widget';
exports = Class(TextInput, function (supr) {
  this._type = 'password';
});
var PasswordInput = exports;


Widget.register(PasswordInput, 'PasswordInput');





