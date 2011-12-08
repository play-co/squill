"use import";

from util.browser import $;
import .Widget;
import .TextInput;

var TextArea = exports = Class(TextInput, function(supr) {
	this._tag = 'textarea';
});

Widget.register(TextArea, 'TextArea');