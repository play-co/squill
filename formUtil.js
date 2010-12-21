jsio('from util.browser import $');

exports.onEnter = function(el, cb) {
	$.onEvent(el, 'keypress', function(evt) {
		if (evt.keyCode == 13) {
			cb();
		}
	});
}

exports.focus = function(el) {
	$.id(el).focus();
}

exports.onPress = function(el, cb) {
	$.onEvent(el, 'click', function(evt) {
		$.stopEvent(evt);
		cb();
	});
}
