jsio('from util.browser import $');
jsio('import .Widget');
jsio('import .TextInput');

var TextArea = exports = Class(TextInput, function (supr) {
  this._tag = 'textarea';
});

Widget.register(TextArea, 'TextArea');
