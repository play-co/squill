jsio('import .TextInput, .Widget');

var PasswordInput = exports = Class(TextInput, function(supr) {
	this._type = 'password';
});


Widget.register(PasswordInput, 'PasswordInput');



